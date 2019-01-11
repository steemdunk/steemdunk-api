import {
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  MoreThan,
  Column,
  Entity,
  Index
} from 'typeorm';
import { User } from './user';

export enum VoteStatus {
  SUCCESS,
  MANUAL_VOTE, // User manually voted
  FAIL,
  DAILY_LIMIT_EXCEEDED,
  PAUSED
}

@Entity()
@Index(['voter', 'author', 'permlink'], { unique: true })
export class VoteLog extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(type => User, { nullable: false })
  @JoinColumn({ name: 'voterId' })
  voter!: User;

  @Column({ nullable: false })
  author!: string;

  @Column({ nullable: false })
  permlink!: string;

  @Column({ type: 'timestamptz', nullable: false })
  timestamp!: Date;

  @Column({ nullable: false })
  weight!: number;

  @Column({ type: 'int', nullable: false })
  status!: VoteStatus;

  public static byUser(user: User): Promise<VoteLog[]> {
    return VoteLog.find({
      where: {
        voter: user,
        timestamp: MoreThan(VoteLog.getMinDate())
      },
      order: {
        timestamp: 'DESC'
      }
    });
  }

  public static filter(user: User,
                        author: string,
                        status: VoteStatus,
                        min: Date): Promise<VoteLog[]> {
    return VoteLog.find({
      where: {
        voter: user,
        timestamp: MoreThan(min ? min : VoteLog.getMinDate()),
        author,
        status
      },
      order: {
        timestamp: 'DESC'
      }
    });
  }

  public static async has(user: User,
                          author: string,
                          permlink: string): Promise<boolean> {
    return (await VoteLog.count({
      where: {
        voter: user,
        author,
        permlink
      }
    })) > 0;
  }

  public static async prune(): Promise<void> {
    await VoteLog
            .createQueryBuilder()
            .delete()
            .where('timestamp <= :date', { date: this.getMinDate() })
            .execute();
  }

  private static getMinDate(): Date {
    return new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
  }

}
