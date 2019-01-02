import {
  VoteStatus,
  VoteLog,
  UserResolver,
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

it('has a log entry', async () => {
  const userResolver = new UserResolver();
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
  let has = await userResolver.hasVoteLogEntry(userA, 'author', 'link');
  expect(has).is.true;

  has = await userResolver.hasVoteLogEntry(userB, 'author', 'link');
  expect(has).is.false;

  await connection.manager.save(entryB);
  has = await userResolver.hasVoteLogEntry(userB, 'author', 'link');
  expect(has).is.true;
});
