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
import { ObjectType, Field, Int } from 'type-graphql';

export enum VoteStatus {
  SUCCESS,
  MANUAL_VOTE, // User manually voted
  FAIL,
  DAILY_LIMIT_EXCEEDED,
  PAUSED
}

@Entity()
@Index(['voter', 'author', 'permlink'], { unique: true })
@ObjectType()
export class VoteLog extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'voterId' })
  @Field(type => User)
  voter!: User;

  @Column()
  @Field()
  author!: string;

  @Column()
  @Field()
  permlink!: string;

  @Column({ type: 'timestamptz' })
  @Field()
  timestamp!: Date;

  @Column()
  @Field(type => Int)
  weight!: number;

  @Column({ type: 'int' })
  @Field(type => VoteStatus)
  status!: VoteStatus;
}
