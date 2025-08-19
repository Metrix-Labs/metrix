const { createCoreRouter } = require('@metrixlabs/metrix').factories;

module.exports = {
  test: createCoreRouter('plugin::myplugin.test', {
    type: 'content-api',
    only: ['find', 'findOne'],
  }),
};
