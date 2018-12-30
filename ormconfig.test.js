module.exports = {
  'host': 'localhost',
  'port': 5432,
  'username': process.env.SD_DB_TEST_USER || 'test',
  'password': process.env.SD_DB_TEST_PASS || 'test',
  'database': process.env_SD_DB_TEST_NAME || 'steemdunk_test',
  'synchronize': true,
  'dropSchema': true,
  'logging': false
};
