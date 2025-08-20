'use strict';

/**
 * unique service
 */

const { createCoreService } = require('@metrixlabs/metrix').factories;

module.exports = createCoreService('api::unique.unique');
