import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  JoinColumn,
  OneToOne,
  Column,
  Entity,
  Index
} from 'typeorm';
import { BotSupport } from './bot_support';
import { Premium } from './premium';
import { ObjectType, Field, ID } from 'type-graphql';

@Entity()
@ObjectType()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn()
  @Field(id => ID)
  id!: number;

  @Column()
  @Index({ unique: true })
  @Field()
  username!: string;

  @CreateDateColumn({ type: "timestamptz" })
  @Field()
  readonly created!: Date;

  @OneToOne(type => Premium, { eager: true })
  @JoinColumn()
  @Field(type => Premium)
  premium!: Premium;

  @OneToOne(type => BotSupport, bot_support => bot_support.user, { eager: true })
  @JoinColumn()
  @Field(type => BotSupport, { name: 'botSupport' })
  bot_support!: BotSupport;

  @Column({ default: false })
  @Field({ name: 'claimRewards' })
  claim_rewards!: boolean;

  @Column({ default: false })
  @Field({ name: 'globalVotePause' })
  global_vote_pause!: boolean;

  @Column({ default: false })
  @Field()
  admin!: boolean;

  /**
   * Used when a user revokes authorization
   */
  @Column({ default: false })
  @Field()
  disabled!: boolean;

}
