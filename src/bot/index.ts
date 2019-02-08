import {
  DisconnectedError,
  TransferOp,
  CommentOp,
  Client
} from 'steeme';
import { Config, LoggerFactory } from 'steemdunk-common';
import { ClaimRewards } from './claim_rewards';
import { Transfer } from './transfer';
import { Comment } from './comment';

export class Bot {

  private static readonly LOGGER = LoggerFactory.create('bot');

  start(): Client {
    const client = new Client(Config.steem_net);
    const transfer = new Transfer(client);
    const comment = new Comment(client);
    const rewards = new ClaimRewards(client);

    comment.start();
    rewards.start();

    client.blockchain.streamBlocks(async (err, block, blockNum) => {
      if (err) {
        if (!(err instanceof DisconnectedError)) {
          Bot.LOGGER.error('Blockchain listening error: ', err);
        }
        return;
      }
      Bot.LOGGER.info(`Processing block ${blockNum} (${block.transactions.length} txs)`);
      for (const tx of block.transactions) {
        for (const op of tx.operations) {
          try {
            if (op[0] === 'transfer') {
              await transfer.handleOp(op[1] as TransferOp[1]);
            } else if (op[0] === 'comment') {
              await comment.handleOp(op[1] as CommentOp[1]);
            }
          } catch (e) {
            Bot.LOGGER.error('Error processing operation ', e);
          }
        }
      }
    });

    return client;
  }
}
