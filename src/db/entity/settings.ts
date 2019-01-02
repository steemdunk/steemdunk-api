import {
  PrimaryColumn,
  BaseEntity,
  Column,
  Entity,
  Check,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

@Entity()
@Check(`id = true`)
@ObjectType()
export class Settings extends BaseEntity {

  @PrimaryColumn({ default: true })
  id!: boolean;

  @Column('timestamptz')
  @Field()
  last_claimed_rewards!: Date;
}
