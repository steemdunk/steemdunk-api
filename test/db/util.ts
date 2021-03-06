import { BotSupport, User, Premium } from '../../src/db';
import { Plan } from 'steemdunk-common';
import { Connection } from 'typeorm';
import * as typeorm from 'typeorm';

export function createConnection(): Promise<Connection> {
  return typeorm.createConnection();
}

export async function createUser(name: string): Promise<User> {
  const sup = new BotSupport();
  await sup.save();

  const premium = new Premium();
  premium.expiry = new Date(Date.now() + 60000);
  premium.plan = Plan.BRONZE;
  await premium.save();

  const user = new User();
  user.username = name;
  user.bot_support = sup;
  user.premium = premium;
  return await user.save();
}
