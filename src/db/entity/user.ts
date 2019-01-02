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
import { ObjectType, Field } from 'type-graphql';

@Entity()
@ObjectType()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn()
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
  @Field(type => BotSupport)
  bot_support!: BotSupport;

  @Column({ default: false })
  @Field()
  claim_rewards!: boolean;

  @Column({ default: false })
  @Field()
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
