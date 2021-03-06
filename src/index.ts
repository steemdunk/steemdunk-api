import 'reflect-metadata';

import { LoggerFactory } from 'steemdunk-common';
import bodyParser from 'koa-bodyparser';
import { getConfig } from './config';
import { Router } from './routes';
import { Client } from 'steeme';
import cors from '@koa/cors';
import { Bot } from './bot';
import { db } from './db';
import chalk from 'chalk';
import Koa from 'koa';

const LOGGER = LoggerFactory.create('server');

async function ensureDbInit(): Promise<void> {
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

async function startBot() {
  const bot = new Bot();
  bot.start();
  LOGGER.info('Bot started');
}

async function startServer() {
  const app = new Koa();
  app.proxy = process.env.TRUST_PROXY === 'true';

  LOGGER.info(`Starting in ${app.env} mode`);
  LOGGER.info(`Trusting proxy headers: ${app.proxy}`);

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const end = Date.now() - start;
    let status: string;
    const statusCode = ctx.response.status;
    if (statusCode >= 400 && statusCode < 500) {
      status = chalk`{yellow ${statusCode.toString()}}`;
    } else if (statusCode >= 500) {
      status = chalk`{red ${statusCode.toString()}}`;
    } else {
      status = chalk`{green ${statusCode.toString()}}`;
    }
    LOGGER.info(`${ctx.ip} ${status} ${ctx.method} ${end}ms ${ctx.url}`);
  });

  app.use(cors({
    allowHeaders: ['content-type', 'session']
  }) as any);
  app.use(bodyParser() as any);

  const r = new Router(new Client(getConfig().steem_net));
  r.install(app);

  const host = process.env.SD_API_HOST || '127.0.0.1';
  const port = Number.parseInt(process.env.SD_API_PORT || '3001');
  app.listen(port, host, () => {
    LOGGER.info(`Server started on http://${host}:${port}`);
  });
}

(async function() {
  await ensureDbInit();
  await startBot();
  await startServer();
})().catch(e => {
  LOGGER.error('Startup error:', e);
});
