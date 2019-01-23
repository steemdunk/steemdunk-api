import { Config, LoggerFactory } from 'steemdunk-common';
import bodyParser from 'koa-bodyparser';
import { Router } from './routes';
import { ensureDbInit } from '.';
import { Client } from 'steeme';
import cors from '@koa/cors';
import chalk from 'chalk';
import Koa from 'koa';

const logger = LoggerFactory.create('server');

(async function() {
  await ensureDbInit();

  const app = new Koa();

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
    logger.info(`${ctx.ip} ${status} ${ctx.method} ${end}ms ${ctx.url}`);
  });

  app.use(cors({
    allowHeaders: ['content-type', 'session']
  }) as any);
  app.use(bodyParser() as any);

  const r = new Router(new Client(Config.steem_net));
  r.install(app);

  const host = process.env.SD_API_HOST || '127.0.0.1';
  const port = Number.parseInt(process.env.SD_API_PORT || '3001');
  app.listen(port, host, () => {
    console.log(`Server started on http://${host}:${port}`);
  });
})().catch(e => {
  console.error('Startup error:', e);
});
