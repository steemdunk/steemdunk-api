import { Client } from 'steeme';
import { User } from '../../db';
import Koa from 'koa';

export interface ProcessApiOpts {
  user: User;
  client: Client;
  ctx: Koa.Context;
  params?: any;
}

export interface RpcIncoming {
  api?: string;
  params?: any;
}

export interface RpcOutgoing {
  data?: any;
  error?: any;
}
