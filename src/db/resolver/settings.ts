import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Settings } from '../entity/settings';

@Resolver(of => Settings)
export class SettingsResolver {

  @Query(returns => Settings)
  async settings(): Promise<Settings> {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      settings.last_claimed_rewards = new Date(0);
      return await settings.save();
    }
    return settings;
  }

  @Mutation(returns => Settings)
  async updateSettings(@Arg('lastClaimedRewards') lastClaimedRewards: Date): Promise<Settings> {
    const settings = await this.settings();
    settings.last_claimed_rewards = lastClaimedRewards;
    return await settings.save();
  }
}
