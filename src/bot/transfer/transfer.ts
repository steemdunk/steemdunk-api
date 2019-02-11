import {
  PrivateKey,
  Client,
  Asset
} from 'steeme';
import { LoggerFactory } from 'steemdunk-common';
import { getConfig } from '../../config';

const key = PrivateKey.fromWif(getConfig().steem_settings.active_wif);
const logger = LoggerFactory.create('bot_transfer_util');

export interface TransferOpts {
  client: Client;

  to: string;
  amount: string|Asset;
  memo: string;
}

export async function guaranteeTransfer(op: TransferOpts): Promise<void> {
  try {
    await op.client.broadcast.transfer(key, {
      from: getConfig().steem_settings.broadcast_account,
      to: op.to,
      amount: op.amount,
      memo: op.memo
    });
  } catch (e) {
    logger.error('Failed to refund user', e);
  }
}
