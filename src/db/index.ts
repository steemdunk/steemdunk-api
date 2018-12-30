export * from './entity/author';
export * from './entity/bot_support';
export * from './entity/premium';
export * from './entity/session';
export * from './entity/settings';
export * from './entity/user';
export * from './entity/vote_log';
export * from './entity/vote_task';
export * from './error_codes';

import { LoggerFactory } from '../logger-factory';
import { createConnection } from 'typeorm';
import { Session } from './entity/session';
import { VoteLog } from './entity/vote_log';

export class Db {

  private static readonly LOGGER = LoggerFactory.create('db');

  private purgeTimer: NodeJS.Timer|undefined;

  public async init() {
    await createConnection();
    this.startPruneTask();
  }

  public stop() {
    this.stopPruneTask();
  }

  private startPruneTask() {
    this.stopPruneTask();
    this.purgeTimer = setInterval(() => {
      Session.prune().catch(err => {
        Db.LOGGER.error('Failed to prune sessions', err);
      });

      VoteLog.prune().catch(err => {
        Db.LOGGER.error('Failed to prune the vote log', err);
      });
    }, 60 * 60 * 1000);
  }

  private stopPruneTask() {
    if (this.purgeTimer) {
      clearInterval(this.purgeTimer);
    }
    this.purgeTimer = undefined;
  }
}

export const db = new Db();
