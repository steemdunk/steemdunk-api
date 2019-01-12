// Load the test environment before anything else
import 'reflect-metadata';

import * as process from 'process';
process.env.NODE_ENV = 'TEST';
process.env.TYPEORM_OVERRIDES = './ormconfig.test.js';

import { setConfig } from 'steemdunk-common';

setConfig({
  steem_net: undefined!,
  steem_settings: undefined!,
  steem_connect: undefined!
});

describe('Database', () => {
  require('./db');
});
