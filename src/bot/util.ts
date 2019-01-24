import {
  Discussion,
  PrivateKey,
  Client
} from 'steeme';
import { Config } from 'steemdunk-common';
import newDebug from 'debug';

const debug = newDebug('bot:util');
const key = PrivateKey.fromWif(Config.steem_settings.posting_wif);

export async function upvote(client: Client,
                              disc: Discussion,
                              weight: number): Promise<void> {
  await client.broadcast.vote(key, {
    voter: Config.steem_settings.broadcast_account,
    permlink: disc.permlink,
    author: disc.author,
    weight
  });
  debug('Successfully upvoted content %s/%s', disc.author, disc.permlink);
}

export async function reply(client: Client,
                            disc: Discussion,
                            response: string): Promise<void> {
  await client.broadcast.comment(key, {
    permlink: 'steemdunk-reply-' + Date.now(),
    parent_permlink: disc.permlink,
    author: Config.steem_settings.broadcast_account,
    parent_author: disc.author,
    title: 'steemdunk-reply-' + Date.now(),
    body: response,
    json_metadata: '{}'
  });
}
