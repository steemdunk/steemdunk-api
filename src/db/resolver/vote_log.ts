import { Resolver, registerEnumType } from 'type-graphql';
import { VoteLog, VoteStatus } from '../entity/vote_log';

@Resolver(of => VoteLog)
export class VoteLogResolver {

}

export async function prune(): Promise<void> {
  await VoteLog
        .createQueryBuilder()
        .delete()
        .where('timestamp <= :date', { date: getMinDate() })
        .execute();
}

export function getMinDate(): Date {
  return new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
}

registerEnumType(VoteStatus, {
  name: 'VoteStatus',
  description: 'Vote status of the log entry'
});
