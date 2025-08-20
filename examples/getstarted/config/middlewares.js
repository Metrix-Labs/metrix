'use strict';

const responseHandlers = require('./src/response-handlers');

module.exports = [
  'metrix::logger',
  'metrix::errors',
  {
    name: 'metrix::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'frame-src': ["'self'"], // URLs that will be loaded in an iframe (e.g. Content Preview)
        },
      },
    },
  },
  'metrix::cors',
  'metrix::poweredBy',
  'metrix::query',
  'metrix::body',
  'metrix::session',
  // 'metrix::compression',
  // 'metrix::ip',
  {
    name: 'metrix::responses',
    config: {
      handlers: responseHandlers,
    },
  },
  'metrix::favicon',
  'metrix::public',
  {
    name: 'global::test-middleware',
    config: {
      foo: 'bar',
    },
  },
  {
    resolve: './src/custom/middleware.js',
    config: {},
  },
];
