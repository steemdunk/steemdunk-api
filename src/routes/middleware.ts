import { User, Session } from '../db';
import HttpStatus from 'http-status';
import { Context } from 'koa';

export const noCache: any = (ctx: Context, next: () => Promise<any>) => {
  ctx.set('Cache-Control', 'no-cache');
  ctx.set('Pragma', 'no-cache');
  return next();
};

export const loadUser: any = async (ctx: Context, next: () => Promise<any>) => {
  ctx.state.user = await Session.get(ctx);
  return next();
};

export const protect: any = async (ctx: Context, next: () => Promise<any>) => {
  if (!ctx.state.user) {
    ctx.status = HttpStatus.UNAUTHORIZED;
    return;
  }
  return next();
};

export const protectAdmin: any = (ctx: Context, next: () => Promise<any>) => {
  const user: User|undefined = ctx.state.user;
  if (user && user.admin === true) {
    return next();
  }
  ctx.status = HttpStatus.UNAUTHORIZED;
}
