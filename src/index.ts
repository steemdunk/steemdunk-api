import 'reflect-metadata';
import { LoggerFactory } from 'steemdunk-common';
import { db } from './db';

export * from './db';

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
