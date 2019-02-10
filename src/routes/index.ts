import { setupSignin } from './signin';
import { noCache } from './middleware';
import { SetupRoute } from './util';
import {setupApiV2} from './api-v2';
import KoaRouter from 'koa-router';
import { Client } from 'steeme';
import Koa from 'koa';

export class Router {

  private readonly router: KoaRouter = new KoaRouter();
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
    this.setup();
  }

  install(app: Koa) {
    app.use(this.router.routes() as any);
    app.use(this.router.allowedMethods() as any);
  }

  private setup() {
    const opts: SetupRoute = {
      router: this.router,
      steemClient: this.client
    };

    this.router.get('/health', noCache, ctx => {
      ctx.body = {
        status: 'OK'
      };
    });
    setupApiV2(opts);
    setupSignin(opts);
  }
}
