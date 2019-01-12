import { createUser, createConnection } from './util';
import { VoteStatus, VoteLog } from '../../src/db';
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

it('has a log entry', async () => {
  const userA = await createUser('A');
  const userB = await createUser('B');

  const entryA = new VoteLog();
  entryA.voter = userA;
  entryA.author = 'author';
  entryA.permlink = 'link';
  entryA.status = VoteStatus.SUCCESS;
  entryA.weight = 10000;
  entryA.timestamp = new Date();

  const entryB = new VoteLog();
  entryB.voter = userB;
  entryB.author = 'author';
  entryB.permlink = 'link';
  entryB.status = VoteStatus.SUCCESS;
  entryB.weight = 10000;
  entryB.timestamp = new Date();

  await connection.manager.save(entryA);
  let has = await VoteLog.has(userA, 'author', 'link');
  expect(has).is.true;

  has = await VoteLog.has(userB, 'author', 'link');
  expect(has).is.false;

  await connection.manager.save(entryB);
  has = await VoteLog.has(userB, 'author', 'link');
  expect(has).is.true;
});
