import {
  DisconnectedError,
  SteemRpcErrorCode,
  SteemRpcError,
  PrivateKey,
  CommentOp,
  SteemUtil,
  Client,
  Util
} from 'steeme';
import {
  LoggerFactory,
  Config
} from 'steemdunk-common';
import newDebug from 'debug';
import { Author, VoteTask, DbErrorCode, VoteLog, VoteStatus } from '../../db';

const debug = newDebug('bot:user_processor');
const BOT_KEY = PrivateKey.fromWif(Config.steem_settings.posting_wif);

interface Task {
  timestamp: number;
  timer: NodeJS.Timer;
}

export class UserProcessor {

  private static readonly LOGGER = LoggerFactory.create('bot_comment_user');

  private readonly client: Client;

  private nextTask: Task|undefined;

  constructor(client: Client) {
    this.client = client;
  }

  async startQueue(): Promise<void> {
    await this.queueNextArticle();
  }

  async handleOp(comment: CommentOp[1]) {
    if (comment.parent_author !== '') {
      // Filter comments so we only have new posts
      return;
    }

    const models = await Author.getPatrons(comment.author);
    for (const m of models) {
      try {
        const user = m.user;
        if (!user.isPremium()
            || (await VoteTask.has(user, comment.author, comment.permlink))) continue;

        const div = SteemUtil.WEIGHT_100_PERCENT / 100;
        const task = new VoteTask();
        task.voter = user;
        task.author = comment.author;
        task.permlink = comment.permlink;
        task.weight = Math.round(div * m.vote_weight);
        task.timestamp = new Date(Date.now() + (m.vote_delay * 60 * 1000))
        this.queueTask(await task.save());
        debug('Queued upvote task: voter=%s article=%s/%s', user.username,
                                                            comment.author,
                                                            comment.permlink);
      } catch (e) {
        // Ignore if the article is already in the queue
        if (e.code !== DbErrorCode.UQ_VIOLATION) {
          UserProcessor.LOGGER.error('Failed to queue article', m, e);
        }
      }
    }
  }

  private async queueNextArticle(delay?: number): Promise<void> {
    const nextArticle = await VoteTask.next();
    if (nextArticle) {
      if (delay) {
        const now = Date.now();
        const nextTime = nextArticle.timestamp.getTime();
        if (nextTime > now) {
          nextArticle.timestamp = new Date(nextTime + delay);
        } else {
          nextArticle.timestamp = new Date(now + delay);
        }
      }
      this.queueTask(nextArticle);
    }
  }

  private queueTask(article: VoteTask): void {
    if (this.nextTask) {
      if (this.nextTask.timestamp < article.timestamp.getTime()) {
        return;
      } else {
        clearTimeout(this.nextTask.timer);
      }
    }

    this.nextTask = {
      timestamp: article.timestamp.getTime(),
      timer: setTimeout(async () => {
        this.nextTask = undefined;
        await this.executeVoteTask(article);
        await this.queueNextArticle();
      }, article.timestamp.getTime() - Date.now())
    };
  }

  private async executeVoteTask(article: VoteTask): Promise<void> {
    try {
      const user = article.voter;
      if (!user.isPremium()
            || (await VoteLog.has(user, article.author, article.permlink))) {
        await article.remove();
        return;
      }

      const status = await this.executeUpvote(article);
      await article.remove();
      try {
        const log = new VoteLog();
        log.voter = user;
        log.author = article.author;
        log.permlink = article.permlink;
        log.status = status;
        log.weight = article.weight;
        log.timestamp = new Date();
        await log.save();
        debug('Recorded log entry: voter=%s article=%s/%s status=%s', user.username,
                                                                      article.author,
                                                                      article.permlink,
                                                                      VoteStatus[status]);
      } catch (e) {
        UserProcessor.LOGGER.error('Failed to save log entry', e);
      }
    } catch (e) {
      UserProcessor.LOGGER.error('Unknown error handling upvote task', e);
      await article.remove();
    }
  }

  private async executeUpvote(article: VoteTask): Promise<VoteStatus> {
    const user = article.voter;
    const model = await Author.findOne({
      where: {
        user,
        author: article.author
      }
    });
    const time = Date.now() - (24 * 60 * 60 * 1000);
    const entries = await VoteLog.filter(user,
                                          article.author,
                                          VoteStatus.SUCCESS,
                                          new Date(time));
    if (user.global_vote_pause === true) {
      return VoteStatus.PAUSED;
    } else if (model && entries && entries.length >= model.max_daily_votes) {
      return VoteStatus.DAILY_LIMIT_EXCEEDED;
    }
    return await this.performUpvote(article);
  }

  private async performUpvote(article: VoteTask): Promise<VoteStatus> {
    const user = article.voter;
    let closedFlag = false;
    let votedTooFastFlag = false;
    for (let i = 0; i < 5; ++i) {
      try {
        await this.client.broadcast.vote(BOT_KEY, {
          voter: user.username,
          author: article.author,
          permlink: article.permlink,
          weight: article.weight
        });
        return VoteStatus.SUCCESS;
      } catch (e) {
        if (e instanceof DisconnectedError) {
          // Try voting again later when we have a connection...
          const info = UserProcessor.articleToString(article);
          UserProcessor.LOGGER.warn(`Attempted to vote with a closed connection: ${info}`);
          closedFlag = true;
          await Util.delay(1000);
          continue;
        } else if (e instanceof SteemRpcError && e.votedTooFast()) {
          const info = UserProcessor.articleToString(article);
          UserProcessor.LOGGER.warn(`Attempted to vote too fast: ${info}`);
          votedTooFastFlag = true;
          await Util.delay(3000);
          continue;
        }

        let status = VoteStatus.FAIL;
        if (e instanceof SteemRpcError) {
          if (e.votedSimilarly()) {
            if (closedFlag && votedTooFastFlag) status = VoteStatus.SUCCESS;
            else status = VoteStatus.MANUAL_VOTE;
          } else if (e.rpcCode === SteemRpcErrorCode.MISSING_POSTING_AUTH) {
            UserProcessor.LOGGER.error(`Steemit user @${user.username} is missing posting authority`);
            if (!user.admin) {
              user.disabled = true;
              await user.save();
            }
          }
        }
        if (status === VoteStatus.FAIL) {
          let msg = e.message;
          if (e instanceof SteemRpcError) {
            msg = e.rpcStack[0].format;
          }
          UserProcessor.LOGGER.error(`Error performing vote on `
                                      + `${article.author}/${article.permlink} `
                                      + `for ${user.username}`, msg);
        }
        return status;
      }
    }
    return VoteStatus.FAIL;
  }

  private static articleToString(article: VoteTask): string {
    const user = article.voter.username;
    const link = `${article.author}/${article.permlink}`;
    return `voter=${user} article=${link}`
  }
}
