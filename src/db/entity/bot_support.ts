import {
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  Entity,
  Column,
  Index
} from 'typeorm';
import { User } from './user';

@Entity()
@Index(['last_vote', 'ban_expiry', 'enabled'])
@Index(['last_vote', 'ban_expiry'])
export class BotSupport extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(type => User, user => user.bot_support)
  user!: User;

  // epoch time for last vote
  @Column({ type: 'timestamptz', default: new Date(0) })
  @Index()
  last_vote!: Date;

  // User is banned from queue until this time expires
  @Column({ type: 'timestamptz', default: new Date(0) })
  @Index()
  ban_expiry!: Date;

  // Whether user wants bot support
  @Column({ default: false })
  @Index()
  enabled!: boolean;

  static async getLatestVote(): Promise<BotSupport|undefined> {
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
  static async getLrv(): Promise<BotSupport|undefined> {
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
