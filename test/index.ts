// Load the test environment before anything else
import 'reflect-metadata';

import * as process from 'process';
process.env.NODE_ENV = 'TEST';
process.env.TYPEORM_OVERRIDES = '../ormconfig.test.js';

import { setConfig } from '../src/config';
setConfig({
  steem_net: undefined as any,
  steem_settings: undefined as any,
  steem_connect: undefined as any,
  https_server: undefined as any
});

describe('Database', () => {
  require('./db');
});

describe('Lock', () => {
  require('./lock');
});
