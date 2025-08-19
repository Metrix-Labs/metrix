'use strict';

/**
 * `test-middleware` middleware
 */

module.exports = (config, { metrix }) => {
  // This middleware is called on every request
  // Add your own logic here.
  return async (ctx, next) => {
    // metrix.log.info('In application test-middleware middleware.');

    await next();
  };
};
