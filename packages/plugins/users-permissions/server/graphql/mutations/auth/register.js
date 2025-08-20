'use strict';

const { toPlainObject } = require('lodash/fp');

const { checkBadRequest } = require('../../utils');

module.exports = ({ nexus, metrix }) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('UsersPermissionsLoginPayload'),

    args: {
      input: nonNull('UsersPermissionsRegisterInput'),
    },

    description: 'Register a user',

    async resolve(parent, args, context) {
      const { koaContext } = context;

      koaContext.request.body = toPlainObject(args.input);

      await metrix.plugin('users-permissions').controller('auth').register(koaContext);

      const output = koaContext.body;

      checkBadRequest(output);

      return {
        user: output.user || output,
        jwt: output.jwt,
      };
    },
  };
};
