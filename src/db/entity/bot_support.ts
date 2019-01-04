import {
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  Entity,
  Column,
  Index
} from 'typeorm';
import { User } from './user';
import { ObjectType, Field, ID } from 'type-graphql';

@Entity()
@Index(['last_vote', 'ban_expiry', 'enabled'])
@Index(['last_vote', 'ban_expiry'])
@ObjectType()
export class BotSupport extends BaseEntity {

  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id!: number;

  @OneToOne(type => User, user => user.bot_support)
  @Field(type => User)
  user!: User;

  // epoch time for last vote
  @Column({ type: 'timestamptz', default: new Date(0) })
  @Index()
  @Field({ name: 'lastVote' })
  last_vote!: Date;

  // User is banned from queue until this time expires
  @Column({ type: 'timestamptz', default: new Date(0) })
  @Index()
  @Field({ name: 'banExpiry' })
  ban_expiry!: Date;

  // Whether user wants bot support
  @Column({ default: false })
  @Index()
  @Field()
  enabled!: boolean;

}
