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
import { Author } from './author';

@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  @Index({ unique: true })
  username!: string;

  @CreateDateColumn({ type: "timestamptz" })
  readonly created!: Date;

  @OneToOne(type => Premium, { nullable: false, eager: true })
  @JoinColumn()
  premium!: Premium;

  @OneToOne(type => BotSupport, bot_support => bot_support.user, { nullable: false, eager: true })
  @JoinColumn()
  bot_support!: BotSupport;

  @Column({ default: false })
  claim_rewards!: boolean;

  @Column({ default: false })
  global_vote_pause!: boolean;

  @Column({ default: false })
  admin!: boolean;

  /**
   * Used when a user revokes authorization
   */
  @Column({ default: false })
  disabled!: boolean;

  public isPremium(): boolean {
    const date = Date.now();
    return (this.premium
              && (this.premium.expiry.getTime() > date))
              || this.admin === true;
  }

  public canVote(): boolean {
    return (!this.disabled && this.isPremium()) || this.admin === true;
  }

  public getSupportedAuthors(): Promise<Author[]> {
    return Author
            .createQueryBuilder()
            .where('"userId" = :user', { user: this.id })
            .getMany();
  }
}
