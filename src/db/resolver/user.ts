import { Resolver, Query, Arg, FieldResolver, Root, Int } from 'type-graphql';
import { User } from '../entity/user';
import { Author } from '../entity/author';
import { VoteStatus, VoteLog } from '../entity/vote_log';
import { MoreThan } from 'typeorm';
import { getMinDate } from './vote_log';

@Resolver(of => User)
export class UserResolver {

  @Query(returns => User, { nullable: true })
  user(@Arg('username') username: string): Promise<User|undefined> {
    return User.findOne({
      where: {
        username
      }
    })
  }

  @FieldResolver(returns => Boolean)
  isPremiumValid(@Root() user: User): boolean {
    const date = Date.now();
    return (user.premium
              && (user.premium.expiry.getTime() > date))
              || user.admin === true;
  }

  @FieldResolver(returns => Boolean)
  canVote(@Root() user: User): boolean {
    return (!user.disabled && this.isPremiumValid(user)) || user.admin === true;
  }

  @FieldResolver(returns => [Author])
  curating(@Root() user: User): Promise<Author[]> {
    return Author.find({
      where: {
        user
      }
    });
  }

  @FieldResolver(returns => Int)
  curationCount(@Root() user: User): Promise<number> {
    return Author.count({
      where: {
        user
      }
    });
  }

  @FieldResolver(returns => [VoteLog])
  voteLog(@Root() user: User,
          @Arg('author', { nullable: true }) author?: string,
          @Arg('status', type => VoteStatus, { nullable: true }) status?: VoteStatus,
          @Arg('minDate', { nullable: true }) min?: Date): Promise<VoteLog[]> {
    const opts: any = {
      voter: user,
      timestamp: MoreThan(min ? min : getMinDate())
    };
    if (author !== undefined) opts.author = author;
    if (status !== undefined) opts.status = status;

    return VoteLog.find({
      where: opts,
      order: {
        timestamp: 'DESC'
      }
    });
  }

  @FieldResolver(returns => Boolean)
  async hasVoteLogEntry(@Root() user: User,
                        @Arg('author') author: string,
                        @Arg('permlink') permlink: string): Promise<boolean> {
    return (await VoteLog.count({
      where: {
        voter: user,
        author,
        permlink
      }
    })) > 0;
  }
}
