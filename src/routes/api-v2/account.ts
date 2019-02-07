import { LoggerFactory, Plan } from 'steemdunk-common';
import { RpcOutgoing, ProcessApiOpts } from './util';
import { Premium, Session } from '../../db';
import { SteemUtil } from 'steeme';

const LOGGER = LoggerFactory.create('api-v2-account');

interface SteemInfo {
  // Information received from Steem
  votingPowerPercent?: number;
}

interface Settings {
  botSupport: boolean;
  claimRewards: boolean;
  globalVotePause: boolean;
}

interface AccountInfo {
  session: string;
  username: string;
  premium: Premium;
  settings: Settings;
  steem: SteemInfo;
}

export async function getAccountInfo(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const info: AccountInfo = {
    session: Session.extractToken(opts.ctx)!,
    username: opts.user.username,
    premium: opts.user.premium,
    settings: {
      claimRewards: opts.user.claim_rewards,
      botSupport: opts.user.bot_support.enabled,
      globalVotePause: opts.user.global_vote_pause
    },
    steem: {}
  };

  try {
    const client = opts.client;
    const accs = await client.db.getAccounts(opts.user.username);
    if (accs.length !== 1) throw new Error('account not found');

    const act = accs[0];
    info.steem.votingPowerPercent = SteemUtil.getVotingPowerPct(act);
  } catch (e) {
    LOGGER.error('Failed to get Steemit account', e);
  }

  return {
    data: info
  };
}

export async function updateSettings(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const settings: Settings = opts.params;
  const support = settings.botSupport;
  const claimRewards = settings.claimRewards;
  const gvPause = settings.globalVotePause;
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

export async function completeDowngrade(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const expiry = new Date(Date.now() + (1000 * 60 * 60 * 24 * 3650));
  const downgradeError = await opts.user.downgrade(Plan.BRONZE, expiry);
  if (downgradeError) {
    return { error: downgradeError };
  }

  return {
    data: opts.user.premium
  };
}
