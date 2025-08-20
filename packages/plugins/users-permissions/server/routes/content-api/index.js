'use strict';

const authRoutes = require('./auth');
const userRoutes = require('./user');
const roleRoutes = require('./role');
const permissionsRoutes = require('./permissions');

module.exports = (metrix) => {
  return {
    type: 'content-api',
    routes: [
      ...authRoutes(metrix),
      ...userRoutes(metrix),
      ...roleRoutes(metrix),
      ...permissionsRoutes(metrix),
    ],
  };
};
