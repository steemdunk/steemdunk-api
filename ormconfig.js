const path = require('path');

let overridesPath;
if (process.env.TYPEORM_OVERRIDES) {
  overridesPath = path.resolve(process.env.TYPEORM_OVERRIDES);
} else {
  overridesPath = path.join(__dirname, 'ormconfig.overrides.js');
}
const overrides = require(overridesPath);

module.exports = Object.assign(overrides, {
  'type': 'postgres',
  'synchronize': false,
  'migrationsRun': true,
  'cli': {
    'entitiesDir': 'src/db/entity',
    'migrationsDir': 'src/db/migration',
    'subscribersDir': 'src/db/subscriber'
  },
  'entities': [
    `${__dirname}/out/db/entity/**/*.js`
  ],
  'migrations': [
    `${__dirname}/out/db/migration/**/*.js`
  ],
  'subscribers': [
    `${__dirname}/out/db/subscriber/**/*.js`
  ]
});
