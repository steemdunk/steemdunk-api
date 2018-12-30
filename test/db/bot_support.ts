import {
  VoteStatus,
  VoteLog,
  BotSupport,
} from '../../src';
import { createUser, createConnection } from './util';
import { Connection } from 'typeorm';
import * as chai from 'chai';

const expect = chai.expect;
let connection: Connection;

before(async () => {
  connection = await createConnection();
});

after(() => {
  connection.close();
});

it('can get the latest vote and least recently voted', async () => {
  const userA = await createUser('A');
  userA.bot_support.enabled = true;
  userA.bot_support.last_vote = new Date(2000);
  await userA.bot_support.save();

  const userB = await createUser('B');
  userB.bot_support.enabled = true;
  userB.bot_support.last_vote = new Date(1000);
  await userB.bot_support.save();

  const userC = await createUser('C');
  userC.bot_support.enabled = false;
  userC.bot_support.last_vote = new Date(0);
  await userC.bot_support.save();

  const vote = (await BotSupport.getLatestVote())!;
  expect(vote).to.exist;
  expect(vote.user).to.exist;
  expect(vote.user.username).to.eq(userA.username);

  const voter = (await BotSupport.getLrv())!;
  expect(voter).to.exist;
  expect(voter.user).to.exist;
  expect(voter.user.username).to.eq(userB.username);
});
