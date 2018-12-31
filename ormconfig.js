const path = require('path');
const fs = require('fs');

let overridesPath;
if (process.env.TYPEORM_OVERRIDES) {
  overridesPath = path.resolve(process.env.TYPEORM_OVERRIDES);
} else {
  overridesPath = path.join(__dirname, 'ormconfig.overrides.js');
}
const overrides = {};
if (fs.existsSync(overridesPath)) {
  const o = require(overridesPath);
  Object.assign(overrides, o);
}

const srcDir = process.env.NODE_ENV !== 'TEST' ? 'lib' : 'src';
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
