import KoaRouter from 'koa-router';
import { Client } from 'steeme';

export interface SetupRoute {
  router: KoaRouter;
  steemClient: Client;
}
