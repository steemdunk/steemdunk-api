import {
  Discussion,
  Client,
  Util
} from 'steeme';
import {
  LoggerFactory,
  Config
} from 'steemdunk-common';
import { BotSupport, User } from '../../db';
import { upvote, reply } from '../util';
import newDebug from 'debug';

const debug = newDebug('bot:bot_support');

const BOT_ACCOUNT = Config.steem_settings.broadcast_account;

export class BotUpvoteSupport {

  private static readonly LOGGER = LoggerFactory.create('bot_comment_support');
  private static readonly MIN_TIME = 60000 * 60 * 2.4;
  private static readonly COMMENT_TEMPLATE = `\
<div class="pull-left">
  <img src="https://steemitimages.com/DQmUPMtijhGPhMzWGPewaCwyGhAkpEmakB5vEEiUDEeEHw7/steemdunk-logo-100x.png">
</div>

Hello, as a member of @steemdunk you have received a free courtesy boost! \
Steemdunk is an automated curation platform that is easy to use and built for \
the community. Join us at https://steemdunk.xyz

Upvote this comment to support the bot and increase your future rewards!
`;

  private readonly client: Client;
  private success: boolean = true;

  constructor(client: Client) {
    this.client = client;
  }

  async start() {
    const time = await this.getNextTime();
    setTimeout(async () => {
      this.success = false;
      for (let i = 0; i < 4; ++i) {
        try {
          const entry = await BotSupport.getLrv();
          const user = entry ? entry.user : undefined;
          if (!user) {
            break;
          } else if (!user.canVote()) {
            // Get this user out of the queue for a full 10 cycles
            user.bot_support.last_vote = new Date(0);
            user.bot_support.ban_expiry = new Date(Date.now() + (BotUpvoteSupport.MIN_TIME * 10));
            await user.bot_support.save();
            debug('User %s can\'t vote, removing from queue for 48 hours', user.username);
            i--; // Backtrack to allow another user to get voted
            continue;
          }

          if (!(await this.handleUser(user))) {
            debug('User %s has no articles to upvote', user.username);
            i--;
          }
        } catch (e) {
          BotUpvoteSupport.LOGGER.error('Unknown error', e);
        }
      }
      await this.start();
    }, time);
  }

  private async getNextTime(): Promise<number> {
    let entry: BotSupport|undefined;
    try {
      entry = await BotSupport.getLatestVote();
    } catch (e) {
      BotUpvoteSupport.LOGGER.error('Failed to communicate with the DB', e);
      this.success = false;
    }

    let time: number = 0;
    if (entry) {
      // Make a vote at a minimum wait time of 2.4 hours
      const elapsed = Date.now() - entry.last_vote.getTime();
      if (elapsed < BotUpvoteSupport.MIN_TIME) {
        time = BotUpvoteSupport.MIN_TIME - elapsed;
      } else {
        time = 0;
      }
    }
    if (!this.success) {
      // Success is marked as false as no votes were able to be made during the
      // last cycle. This prevents wasting CPU cycles and bandwidth, while still
      // being responsive to new articles.
      time = 60000 * 2;
      debug('No content was voted in the previous cycle');
    }

    if (debug.enabled) {
      const id = entry ? `(last voted user ${entry.user.username})` : '';
      debug('Sleep time before cycle begins %d %s', time, id);
    }

    return time;
  }

  private async handleUser(user: User): Promise<boolean> {
    await Util.delay(1000 * 25);
    const disc = await this.getDiscussion(user);
    if (disc) {
      this.success = true;
      user.bot_support.last_vote = new Date();
      await user.bot_support.save();
      await upvote(this.client, disc, Config.steem_settings.voting_power);
      await reply(this.client, disc, BotUpvoteSupport.COMMENT_TEMPLATE);
      return true;
    }

    // Exclude the user from the cycle
    user.bot_support.ban_expiry = new Date();
    await user.bot_support.save();
    return false;
  }

  private async getDiscussion(user: User): Promise<Discussion|undefined> {
    const articles = await this.client.db.getDiscussionsByBlog({
      tag: user.username,
      limit: 15 // Beyond this we don't care, the user needs unique content
    });

    for (const disc of articles) {
      if (disc.author !== user.username) {
        // Ignore resteemed articles
        continue;
      } else if (disc.cashout_time === '1969-12-31T23:59:59') {
        // This article was already paid out
        break;
      }

      const voters = disc.active_votes.map(v => v.voter);
      if (voters.includes(BOT_ACCOUNT)) {
        debug('Bot already upvoted article %s/%s', disc.author, disc.permlink);
        break;
      }

      return disc;
    }
  }
}
