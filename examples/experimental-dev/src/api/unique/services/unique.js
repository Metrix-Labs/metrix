'use strict';

/**
 * unique service
 */

const { createCoreService } = require('@metrix/metrix').factories;

module.exports = createCoreService('api::unique.unique');
