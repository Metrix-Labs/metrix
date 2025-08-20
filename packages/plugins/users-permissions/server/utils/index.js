'use strict';

const sanitize = require('./sanitize');

const getService = (name) => {
  return metrix.plugin('users-permissions').service(name);
};

module.exports = {
  getService,
  sanitize,
};
