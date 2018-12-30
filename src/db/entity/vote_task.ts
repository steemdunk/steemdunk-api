import {
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Column,
  Entity,
  Index
} from 'typeorm';
import { User } from './user';

@Entity()
@Index(['voter', 'author', 'permlink'], { unique: true })
export class VoteTask extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(type => User, { eager: true })
  @JoinColumn()
  voter!: User;

  @Column({ nullable: false })
  author!: string;

  @Column({ nullable: false })
  permlink!: string;

  @Column({ type: "timestamptz", nullable: false })
  @Index()
  timestamp!: Date;

  @Column({ nullable: false })
  weight!: number;

  /**
   * Returns the article that is next to be voted on.
   */
  public static next(): Promise<VoteTask|undefined> {
    return VoteTask.findOne({
      order: {
        timestamp: 'ASC'
      }
    });
  }

  public static async has(user: User,
                          author: string,
                          permlink: string): Promise<boolean> {
    return (await VoteTask.count({
      where: {
        voter: user,
        author,
        permlink
      }
    })) > 0;
  }
}
