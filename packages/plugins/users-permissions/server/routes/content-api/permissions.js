'use strict';

const { UsersPermissionsRouteValidator } = require('./validation');

module.exports = (metrix) => {
  const validator = new UsersPermissionsRouteValidator(metrix);

  return [
    {
      method: 'GET',
      path: '/permissions',
      handler: 'permissions.getPermissions',
      response: validator.permissionsResponseSchema,
    },
  ];
};
