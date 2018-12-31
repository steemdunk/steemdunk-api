// Load the test environment before anything else
import 'reflect-metadata';

import * as process from 'process';
process.env.NODE_ENV = 'TEST';
process.env.TYPEORM_OVERRIDES = './ormconfig.test.js';

describe('Database', () => {
  require('./db');
});
