import { Resolver, Query } from "type-graphql";
import { BotSupport } from "../entity/bot_support";
import { User } from "../entity/user";

@Resolver(of => BotSupport)
export class BotSupportResolver {

  @Query(returns => BotSupport, { nullable: true })
  static async botSupportLatestVote(): Promise<BotSupport|undefined> {
    const entry = await BotSupport
                    .createQueryBuilder('s')
                    .leftJoinAndSelect('s.user', 'user')
                    .where('ban_expiry < :date', { date: new Date() })
                    .orderBy('last_vote', 'DESC')
                    .getOne();
    if (entry) {
      entry.user.bot_support = entry;
      return entry;
    }
  }

  /**
   * Least recently voted
   */
  @Query(returns => BotSupport, { nullable: true })
  static async botSupportLrv(): Promise<BotSupport|undefined> {
    let date = new Date(Date.now() - (1000 * 60 * 60 * 24));
    const entry = await User
                          .createQueryBuilder('u')
                          .leftJoinAndSelect('u.premium', 'user')
                          .leftJoinAndSelect('u.bot_support', 'bot_support')
                          .where('bot_support.enabled = true')
                          .andWhere('bot_support.ban_expiry < :date', { date })
                          .andWhere('bot_support.last_vote < :date', { date })
                          .orderBy('bot_support.last_vote', 'ASC')
                          .getOne();
    if (entry) {
      entry.bot_support.user = entry;
      return entry.bot_support;
    }
  }

}
