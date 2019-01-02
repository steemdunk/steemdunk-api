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
import { ObjectType, Field, Int } from 'type-graphql';

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
@ObjectType()
export class Author extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'userId' })
  @Field(type => User)
  user!: User;

  @Column()
  @Field()
  author!: string;

  @Column()
  @Field(type => Int)
  vote_weight!: number; // percentage

  @Column()
  @Field(type => Int)
  vote_delay!: number; // unit in minutes

  @Column()
  @Field(type => Int)
  max_daily_votes!: number;

}
