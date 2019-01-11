import { RpcOutgoing, ProcessApiOpts } from './util';
import { LoggerFactory } from 'steemdunk-common';
import { SteemUtil } from 'steeme';
import { Premium, Session } from '../../db';

const LOGGER = LoggerFactory.create('api-v2-account');

interface SteemInfo {
  // Information received from Steem
  voting_power_percent?: number;
}

interface AccountInfo {
  username: string;
  session: string;
  bot_support: boolean;
  claim_rewards: boolean;
  global_vote_pause: boolean;
  premium?: Premium;
  steem?: SteemInfo;
}

export async function getAccountInfo(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const info: AccountInfo = {
    username: opts.user.username,
    session: Session.extractToken(opts.ctx)!,
    premium: opts.user.premium,
    claim_rewards: opts.user.claim_rewards,
    bot_support: opts.user.bot_support.enabled,
    global_vote_pause: opts.user.global_vote_pause
  };

  info.steem = {};

  try {
    const client = opts.client;
    const accs = await client.db.getAccounts(opts.user.username);
    if (accs.length !== 1) throw new Error('account not found');

    const act = accs[0];
    info.steem.voting_power_percent = SteemUtil.getVotingPowerPct(act);
  } catch (e) {
    LOGGER.error('Failed to get Steemit account', e);
  }

  return {
    data: info
  };
}

export async function setSettings(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const support = opts.params.bot_support;
  const claimRewards = opts.params.claim_rewards;
  const gvPause = opts.params.global_vote_pause;
  if (support === undefined || typeof(support) !== 'boolean') {
    return { error: 'Invalid bot_support parameter' };
  } else if (claimRewards === undefined || typeof(claimRewards) !== 'boolean') {
    return { error: 'Invalid claim_rewards parameter' };
  } else if (claimRewards === undefined || typeof(gvPause) !== 'boolean') {
    return { error: 'Invalid global_vote_pause parameter' };
  }

  const user = opts.user;
  user.bot_support.enabled = support;
  await user.bot_support.save();

  user.claim_rewards = claimRewards;
  user.global_vote_pause = gvPause;
  await user.save();

  return {};
}
