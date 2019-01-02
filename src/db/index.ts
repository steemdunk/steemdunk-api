export * from './entity/author';
export * from './entity/bot_support';
export * from './entity/premium';
export * from './entity/session';
export * from './entity/settings';
export * from './entity/user';
export * from './entity/vote_log';
export * from './entity/vote_task';
export * from './error_codes';

export * from './resolver/author';
export * from './resolver/bot_support';
export * from './resolver/premium';
export * from './resolver/settings';
export * from './resolver/user';
export * from './resolver/vote_log';
export * from './resolver/vote_task';

import { LoggerFactory } from 'steemdunk-common';
import { createConnection } from 'typeorm';
import { Session } from './entity/session';
import { prune as voteLogPrune } from './resolver/vote_log';

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

      voteLogPrune().catch(err => {
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
