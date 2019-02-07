import {
  TransferOp,
  SteemUtil,
  AssetUnit,
  Client
} from 'steeme';
import {
  PlanPrice,
  Payment,
  Config,
  Plan
} from 'steemdunk-common';
import { guaranteeTransfer } from './transfer';
import { User, Author } from '../../db';

export class Transfer {

  constructor(readonly client: Client) {
  }

  async handleOp(transfer: TransferOp[1]) {
    if (transfer.to !== Config.steem_settings.broadcast_account) {
      return;
    }

    const asset = SteemUtil.parseAsset(transfer.amount as string);
    if (asset.amount < 0.005) {
      return;
    }

    const memo = transfer.memo && transfer.memo.trim();
    if (memo.toLowerCase() === 'donate'
        || memo.toLowerCase() === 'donation') {
      return await guaranteeTransfer({
        client: this.client,
        to: transfer.from,
        amount: '0.001 ' + asset.unit,
        memo: 'Thank you for your donation!'
      });
    }

    if (asset.unit !== AssetUnit.SBD) {
      return await guaranteeTransfer({
        client: this.client,
        to: transfer.from,
        amount: transfer.amount,
        memo: `Refund - Only Steem Dollars (SBD) are accepted for payments. \
To send a donation, please use "donate" as your memo`
      });
    }

    // Disable paid upvotes for now
    /*if (asset.amount === votePrice) {
      return await processUpvote(this.client, transfer);
    }*/

    const user = await User.findOne({
      where: {
        username: transfer.from
      }
    });
    if (!user) {
      return await guaranteeTransfer({
        client: this.client,
        to: transfer.from,
        amount: transfer.amount,
        memo: `Refund - This account is not registered on Steemdunk. Join us \
at https://steemdunk.xyz`
      });
    }

    await this.processPlanPayment(user, transfer);
  }

  private async processPlanPayment(user: User, transfer: TransferOp[1]) {
    const asset = SteemUtil.parseAsset(transfer.amount as string);

    let planStr = transfer.memo.trim().toUpperCase();
    const monthly = planStr.endsWith('_MONTHLY');
    if (monthly) planStr = planStr.substring(0, planStr.length - '_MONTHLY'.length);

    const plan: Plan = Plan[planStr];
    if (!plan) {
      return await guaranteeTransfer({
        client: this.client,
        to: transfer.from,
        amount: transfer.amount,
        memo: `Refund - Invalid plan memo received. Visit \
https://steemdunk.xyz/upgrade for valid plan payments.`
      });
    }

    if (asset.amount !== PlanPrice[planStr + (monthly ? '_MONTHLY' : '')]) {
      return await guaranteeTransfer({
        client: this.client,
        to: transfer.from,
        amount: transfer.amount,
        memo: `Refund - Invalid plan payment amount received. Visit \
https://steemdunk.xyz/upgrade for more information.`
      });
    }

    const expiry = new Date();
    if (monthly) expiry.setUTCMonth(expiry.getUTCMonth() + 1);
    else expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);

    const downgradeError = await user.downgrade(plan, expiry);
    if (downgradeError) {
      return await guaranteeTransfer({
        client: this.client,
        to: transfer.from,
        amount: transfer.amount,
        memo: `Refund - Plan downgrade failed with reason: ${downgradeError}`
      });
    }

    await guaranteeTransfer({
      client: this.client,
      to: transfer.from,
      amount: '0.001 SBD',
      memo: `Success - Your plan has been activated for ${Plan[plan]} and will \
expire on ${this.dateToString(expiry)}`
    });
  }

  private dateToString(date: Date) {
    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
  }
}
