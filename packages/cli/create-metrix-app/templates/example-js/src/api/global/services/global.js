'use strict';

/**
 * global service.
 */

const { createCoreService } = require('@metrix/metrix').factories;

module.exports = createCoreService('api::global.global');
