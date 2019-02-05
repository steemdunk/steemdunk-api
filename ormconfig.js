const path = require('path');

let overridesPath;
if (process.env.TYPEORM_OVERRIDES) {
  overridesPath = path.resolve(process.env.TYPEORM_OVERRIDES);
} else {
  overridesPath = path.join(__dirname, 'ormconfig.overrides.js');
}
const overrides = require(overridesPath);
const srcDir = process.env.NODE_ENV !== 'TEST' ? 'out' : 'src';

module.exports = Object.assign({
  'type': 'postgres',
  'synchronize': false,
  'entities': [
    `${__dirname}/${srcDir}/db/entity/**/*{.ts,.js}`
  ],
  'migrations': [
    `${__dirname}/${srcDir}/db/migration/**/*{.ts,.js}`
  ],
  'subscribers': [
    `${__dirname}/${srcDir}/db/subscriber/**/*{.ts,.js}`
  ]
}, overrides);
