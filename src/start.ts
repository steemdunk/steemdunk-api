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
import { ApolloServer } from 'apollo-server-koa';
import { ensureDbInit } from '.';
import { buildSchema } from 'type-graphql';

(async function() {
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
    ],
  });
  const server = new ApolloServer({ schema });

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
