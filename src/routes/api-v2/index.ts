import {
  getAuthors,
  rmAuthor,
  addAuthor,
  updateAuthor
} from './authors';
import {
  protect,
  noCache,
  loadUser
} from '../middleware';
import {ProcessApiOpts, RpcIncoming, RpcOutgoing} from './util';
import {getAccountInfo, updateSettings} from './account';
import HttpStatus from 'http-status';
import {getVoteLog} from './voting';
import {SetupRoute} from '../util';
import { Context } from 'koa';

function userApi(rpc: RpcIncoming, opts: ProcessApiOpts): Promise<RpcOutgoing> {
  switch (rpc.api) {
    // Author APIs
    case 'get_authors':
      return getAuthors(opts);
    case 'remove_author':
      return rmAuthor(opts);
    case 'add_author':
      return addAuthor(opts);
    case 'update_author':
      return updateAuthor(opts);
    // Voting APIs
    case 'get_vote_log':
      return getVoteLog(opts);
    // Account APIs
    case 'get_account':
      return getAccountInfo(opts);
    case 'update_settings':
      return updateSettings(opts);
  }
  return undefined as any;
}

export function setupApiV2(opts: SetupRoute) {
  const middleware = [
    noCache,
    (ctx: Context, next: () => Promise<any>) => {
      const rpc: RpcIncoming = (ctx.request as any).body;
      ctx.state.rpc = rpc;
      ctx.state.opts = <ProcessApiOpts>{
        user: ctx.state.user,
        params: rpc.params,
        client: opts.steemClient,
        ctx: ctx as any
      };
      return next();
    }
  ];

  opts.router.post('/api/v2',
                    loadUser,
                    protect,
                    ...middleware,
                    async (ctx, next) => {
    ctx.state.res = await userApi(ctx.state.rpc, ctx.state.opts);
    return await next();
  }, processResponse);
}

const processResponse: any = (ctx: Context) => {
  let response: RpcOutgoing|undefined = ctx.state.res;
  if (!response) {
    response = {
      error: 'There was an error processing your request.'
    };
  }
  if (response.error) {
    ctx.status = HttpStatus.BAD_REQUEST;
  } else {
    ctx.status = HttpStatus.OK;
  }
  ctx.body = response;
}
