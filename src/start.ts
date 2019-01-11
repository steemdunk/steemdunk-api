import bodyParser from 'koa-bodyparser';
import { Router } from './routes';
import { ensureDbInit } from '.';
import Koa from 'koa';
import { Client } from 'steeme';
import { Config } from 'steemdunk-common';

(async function() {
  await ensureDbInit();

  const app = new Koa();
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
