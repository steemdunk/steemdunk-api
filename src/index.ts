import 'reflect-metadata';

import {
  AuthorResolver,
  BotSupportResolver,
  PremiumResolver,
  SettingsResolver,
  UserResolver,
  VoteLogResolver,
  VoteTaskResolver
} from './db';
import { LoggerFactory } from 'steemdunk-common';
import { buildSchema } from 'type-graphql';
import { GraphQLSchema } from 'graphql';
import { db } from './db';

const LOGGER = LoggerFactory.create('db_initializer');

/**
 * This function is expected to not fail and must guarantee the db connection
 * is opened
 */
export async function ensureDbInit(): Promise<void> {
  while (true) {
    try {
      await db.init();
      break;
    } catch (e) {
      LOGGER.error('Failed to initialize db...trying again', e);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

export async function buildDefaultSchema(): Promise<GraphQLSchema> {
  return await buildSchema({
    resolvers: [
      AuthorResolver,
      BotSupportResolver,
      PremiumResolver,
      SettingsResolver,
      UserResolver,
      VoteLogResolver,
      VoteTaskResolver
    ]
  });
}
