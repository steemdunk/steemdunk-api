import {
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  Entity
} from 'typeorm';
import { Plan } from 'steemdunk-common';
import { ObjectType, Field } from 'type-graphql';

@Entity()
@ObjectType()
export class Premium extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int")
  @Field(type => Plan)
  plan!: Plan;

  @Column({ type: "timestamptz" })
  @Field()
  expiry!: Date;
}
