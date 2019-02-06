import {
  PrivateKey,
  SteemUtil,
  Account,
  Client
} from 'steeme';
import {
  LoggerFactory,
  Config,
} from 'steemdunk-common';
import newDebug from 'debug';
import { Settings, User } from '../../db';

const debug = newDebug('bot:claim_rewards');

export class ClaimRewards {

  private static readonly logger = LoggerFactory.create('bot_claim_rewards');
  private readonly minTime = 1000 * 60 * 60 * 24;
  private readonly postingKey: PrivateKey;

  constructor(readonly client: Client) {
    this.postingKey = PrivateKey.fromWif(Config.steem_settings.posting_wif);
  }

  async start() {
    let lastClaimed: number;
    try {
      lastClaimed = (await Settings.get()).last_claimed_rewards.getTime();
    } catch (e) {
      ClaimRewards.logger.error('Failed to communicate with the DB', e);
      lastClaimed = 0;
    }
    let time = Date.now() - lastClaimed;
    if (time < this.minTime) {
      time = this.minTime - time;
    } else {
      time = 5000;
    }
    debug('Next claim rewards time is %d ms', time);
    setTimeout(async () => {
      try {
        {
          const botAcc = Config.steem_settings.broadcast_account;
          const acc = (await this.client.db.getAccounts(botAcc))[0];
          await this.claimRewards(acc);
        }

        const users = await User.find({
          where: {
            disabled: false,
            claim_rewards: true
          }
        });
        for (const u of users) {
          try {
            if (!u.isPremium()) continue;
            const acc = (await this.client.db.getAccounts(u.username))[0];
            await this.claimRewards(acc);
          } catch (e) {
            ClaimRewards.logger.error(`Error claiming rewards for @${u.username}`, e);
          }
        }

        try {
          const settings = await Settings.get();
          settings.last_claimed_rewards = new Date();
          await settings.save();
        } catch (e) {
          ClaimRewards.logger.error('Failed to interact with the DB', e);
        }
      } catch (e) {
        ClaimRewards.logger.error('Error running reward claiming loop', e);
      } finally {
        this.start();
      }
    }, time);
  }

  async claimRewards(acc: Account) {
    if (SteemUtil.parseAsset(acc.reward_sbd_balance).amount > 0
          || SteemUtil.parseAsset(acc.reward_steem_balance).amount > 0
          || SteemUtil.parseAsset(acc.reward_vesting_balance).amount > 0) {
      await this.client.broadcast.claimRewardBalance(this.postingKey, {
        account: acc.name,
        reward_steem: acc.reward_steem_balance,
        reward_sbd: acc.reward_sbd_balance,
        reward_vests: acc.reward_vesting_balance
      });
    }
  }
}
