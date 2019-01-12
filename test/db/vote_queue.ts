import { createUser, createConnection } from './util';
import { VoteTask } from '../../src/db';
import { Connection } from 'typeorm';

let connection: Connection;

before(async () => {
  connection = await createConnection();
});

after(() => {
  connection.close();
});

it('can queue articles for voting', async () => {
  const user = await createUser('A');
  const task = new VoteTask();
  task.voter = user;
  task.author = 'author';
  task.permlink = 'link';
  task.weight = 10000;
  task.timestamp = new Date();
  await task.save();
});
