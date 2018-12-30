import {
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Entity,
  Column,
  Index
} from 'typeorm';
import { User } from './user';

export interface AuthorModel {
  author: string;
  vote_weight: number; // percentage
  vote_delay: number; // unit in minutes
  max_daily_votes: number;
}

export interface UserModel {
  user: User;
  author: AuthorModel;
}

@Entity()
@Index(['user', 'author'], { unique: true })
@Index(['author'])
@Index(['user'])
export class Author extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(type => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: false })
  author!: string;

  @Column({ nullable: false })
  vote_weight!: number; // percentage

  @Column({ nullable: false })
  vote_delay!: number; // unit in minutes

  @Column({ nullable: false })
  max_daily_votes!: number;

  public static getPatrons(author: string): Promise<Author[]> {
    return Author.find({
      where: {
        author
      },
      relations: [ 'user' ]
    });
  }

  public static getCount(user: User): Promise<number> {
    return Author.count({
      where: {
        user
      }
    });
  }
}
