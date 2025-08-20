'use strict';

const createAuthenticatedUser = async ({ metrix, userInfo }) => {
  const defaultRole = await metrix.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });

  const user = await metrix.service('plugin::users-permissions.user').add({
    role: defaultRole.id,
    ...userInfo,
  });

  const jwt = metrix.service('plugin::users-permissions.jwt').issue({ id: user.id });

  return { user, jwt };
};

module.exports = {
  createAuthenticatedUser,
};
