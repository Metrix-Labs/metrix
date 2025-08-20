'use strict';

/**
 * `test-policy` policy
 */

module.exports = (policyCtx, config, { metrix }) => {
  // Add your own logic here.
  metrix.log.info('In test-policy policy.');

  const canDoSomething = true;

  if (canDoSomething) {
    return true;
  }

  return false;
};
