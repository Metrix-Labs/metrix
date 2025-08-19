'use strict';

const { createCoreRouter } = require('@metrix/metrix').factories;

module.exports = createCoreRouter('api::address.address', {
  config: {
    find: {
      // auth: false,
    },
  },
  only: ['find', 'findOne'],
});
