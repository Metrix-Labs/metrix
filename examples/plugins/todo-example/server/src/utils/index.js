'use strict';

// Retrieve a local service
function getService(name) {
  return metrix.plugin('todo').service(name);
}

module.exports = {
  getService,
};
