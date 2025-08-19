'use strict';

/**
 * testing service
 */

const { createCoreService } = require('@metrix/metrix').factories;

module.exports = createCoreService('api::testing.testing');
