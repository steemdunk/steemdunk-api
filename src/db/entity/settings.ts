import {
  PrimaryColumn,
  BaseEntity,
  Column,
  Entity,
  Check,
} from 'typeorm';

@Entity()
@Check(`id = true`)
export class Settings extends BaseEntity {

  @PrimaryColumn({ default: true })
  id!: boolean;

  @Column('timestamptz')
  last_claimed_rewards!: Date;

  public static async get(): Promise<Settings> {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      settings.last_claimed_rewards = new Date(0);
      return await settings.save();
    }
    return settings;
  }
}
