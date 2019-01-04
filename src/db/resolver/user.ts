import {
  Resolver,
  Query,
  Arg,
  Field,
  FieldResolver,
  Root,
  Int,
  Mutation,
  ID,
  InputType
} from 'type-graphql';
import { User } from '../entity/user';
import { Author } from '../entity/author';
import { VoteStatus, VoteLog } from '../entity/vote_log';
import { MoreThan } from 'typeorm';
import { getMinDate } from './vote_log';
import { Plan } from 'steemdunk-common';
import { Premium } from '../entity/premium';
import { BotSupport } from '../entity/bot_support';
import { ResourceNotFoundError } from '../errors';

@InputType()
export class UserInput {
  @Field(type => ID)
  id!: number;

  @Field({ nullable: true })
  disabled?: boolean;
}

@Resolver(of => User)
export class UserResolver {

  @Query(returns => User, { nullable: true })
  user(@Arg('username') username: string): Promise<User|undefined> {
    return User.findOne({
      where: {
        username
      }
    });
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

  @Mutation(returns => User)
  async createUser(@Arg('username') username: string): Promise<User> {
    const premium = new Premium();
    premium.plan = Plan.BRONZE;
    premium.expiry = new Date(Date.now() + (1000 * 60 * 60 * 24 * 3650));
    await premium.save();

    const sup = new BotSupport();
    await sup.save();

    let user = new User();
    user.username = username;
    user.premium = premium;
    user.bot_support = sup;
    user = await user.save();

    sup.user = user;
    await sup.save();

    return user;
  }

  @Mutation(returns => User)
  async updateUser(@Arg('input') input: UserInput): Promise<User> {
    const user = await User.findOne(input.id);
    if (!user) throw new ResourceNotFoundError('User ID not found');
    if (input.disabled !== undefined) user.disabled = input.disabled;
    return await user.save();
  }
}
