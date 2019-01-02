import { Resolver, Query, Arg } from 'type-graphql';
import { VoteTask } from '../entity/vote_task';

@Resolver(of => VoteTask)
export class VoteTaskResolver {
  /**
   * Returns the article that is next to be voted on.
   */
  @Query(returns => VoteTask, { nullable: true })
  static nextVoteTask(): Promise<VoteTask|undefined> {
    return VoteTask.findOne({
      order: {
        timestamp: 'ASC'
      }
    });
  }

  @Query(returns => Boolean)
  static async hasVoteTask(@Arg('user') user: string,
                            @Arg('author') author: string,
                            @Arg('permlink') permlink: string): Promise<boolean> {
    return (await VoteTask.count({
      where: {
        voter: user,
        author,
        permlink
      }
    })) > 0;
  }
}
