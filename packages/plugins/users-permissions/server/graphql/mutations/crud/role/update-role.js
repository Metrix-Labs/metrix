'use strict';

const usersPermissionsRoleUID = 'plugin::users-permissions.role';

module.exports = ({ nexus, metrix }) => {
  const { getContentTypeInputName } = metrix.plugin('graphql').service('utils').naming;
  const { nonNull } = nexus;

  const roleContentType = metrix.getModel(usersPermissionsRoleUID);

  const roleInputName = getContentTypeInputName(roleContentType);

  return {
    type: 'UsersPermissionsUpdateRolePayload',

    args: {
      id: nonNull('ID'),
      data: nonNull(roleInputName),
    },

    description: 'Update an existing role',

    async resolve(parent, args, context) {
      const { koaContext } = context;

      koaContext.params = { role: args.id };
      koaContext.request.body = args.data;
      koaContext.request.body.role = args.id;

      await metrix.plugin('users-permissions').controller('role').updateRole(koaContext);

      return { ok: true };
    },
  };
};
