import {
  Author,
  User,
  UserResolver,
} from '../../src';
import { createUser, createConnection } from './util';
import { Connection } from 'typeorm';
import * as chai from 'chai';
import { AuthorResolver } from '../../src/db/resolver/author';

const expect = chai.expect;
let connection: Connection;
let users: User[] = [];

before(async () => {
  connection = await createConnection();
  for (let i = 0; i < 10; ++i) {
    users.push(await createUser(`${i}`));
  }
  for (let i = 0; i < users.length; ++i) {
    const user = users[i];
    for (let j = i + 1; j < users.length; ++j) {
      const author = new Author();
      author.user = user;
      author.author = users[j].username;
      author.vote_delay = i;
      author.vote_weight = i;
      author.max_daily_votes = i;
      await author.save();
    }
  }
});

after(() => {
  connection.close();
});

it('can get author supported by multiple users', async () => {
  const max = 10;
  for (let i = 0; i < max; ++i) {
    const authors = await AuthorResolver.patrons(i.toString());
    expect(authors.length).to.eq(i);
    for (let j = 0; j < authors.length; ++j) {
      expect(authors[j].user.username).to.eq(j.toString());
      expect(authors[j].user.premium).to.exist;
      expect(authors[j].user.bot_support).to.not.be.undefined;
    }
  }
});

it('can get supported authors by user', async () => {
  for (let i = 0; i < users.length; ++i) {
    const user = users[i];
    const authors = await new UserResolver().curating(user);
    expect(authors.length).to.eq(users.length - i - 1);
    for (let j = 0; j < authors.length; ++j) {
      expect(authors[j].author).to.eq((j + i + 1).toString());
      expect(authors[j].max_daily_votes).to.eq(i);
    }
  }
});
