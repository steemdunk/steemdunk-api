import {
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  Entity
} from 'typeorm';
import { Plan } from 'steemdunk-common';

@Entity()
export class Premium extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int")
  plan!: Plan;

  @Column({ type: "timestamptz" })
  expiry!: Date;
}
