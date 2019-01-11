import { ProcessApiOpts, RpcOutgoing } from './util';
import { SteemUtil } from 'steeme';
import { VoteLog } from '../../db';

export async function getVoteLog(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const log = await VoteLog.byUser(opts.user);
  return {
    data: log.map(val => <any>{
      voter: val.voter,
      author: val.author,
      permlink: val.permlink,
      timestamp: val.timestamp.getTime(),
      weight: Math.round(val.weight / SteemUtil.WEIGHT_100_PERCENT * 100),
      status: val.status
    })
  };
}
