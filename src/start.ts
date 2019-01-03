import {
  AuthorResolver,
  BotSupportResolver,
  PremiumResolver,
  SettingsResolver,
  UserResolver,
  VoteLogResolver,
  VoteTaskResolver
} from './db';
import Koa from 'koa';
import { ApolloServer, AuthenticationError } from 'apollo-server-koa';
import { ensureDbInit } from '.';
import { buildSchema } from 'type-graphql';
import { StringUtil } from 'steemdunk-common';

(async function() {
  const token = process.env.SD_API_TOKEN;
  if (token === undefined) {
    console.log('SD_API_TOKEN not specified, generating a token');
    console.log('New token...', StringUtil.genSecureAlphaNumeric(32));
    return;
  }

  await ensureDbInit();

  const schema = await buildSchema({
    resolvers: [
      AuthorResolver,
      BotSupportResolver,
      PremiumResolver,
      SettingsResolver,
      UserResolver,
      VoteLogResolver,
      VoteTaskResolver
    ]
  });
  const server = new ApolloServer({
    schema,
    context: ({ ctx }: any) => {
      if (ctx.headers.api_token !== token) {
        throw new AuthenticationError('Authentication failure');
      }
      return {};
    }
  });

  const app = new Koa();
  server.applyMiddleware({
    app,
    path: '/db'
  });

  const host = process.env.SD_API_HOST || '127.0.0.1';
  const port = Number.parseInt(process.env.SD_API_PORT || '3000');
  app.listen(port, host, () => {
    console.log(`Server started on http://${host}:${port}`);
  });
})().catch(e => {
  console.error('Startup error:', e);
});
