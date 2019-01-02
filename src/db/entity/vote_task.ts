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
import { ObjectType, Field, Query, Arg } from 'type-graphql';

@Entity()
@Index(['voter', 'author', 'permlink'], { unique: true })
@ObjectType()
export class VoteTask extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(type => User, { eager: true })
  @JoinColumn()
  @Field(type => User)
  voter!: User;

  @Column()
  @Field()
  author!: string;

  @Column()
  @Field()
  permlink!: string;

  @Column({ type: "timestamptz" })
  @Index()
  @Field()
  timestamp!: Date;

  @Column()
  @Field()
  weight!: number;
}
