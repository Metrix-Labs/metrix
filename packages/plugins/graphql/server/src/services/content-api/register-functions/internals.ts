import type { Context } from '../../types';

const registerInternals = ({ registry, metrix }: Context) => {
  const { buildInternalTypes } = metrix.plugin('graphql').service('internals');

  const internalTypes = buildInternalTypes({ metrix });

  for (const [kind, definitions] of Object.entries(internalTypes)) {
    registry.registerMany(Object.entries(definitions as any), { kind });
  }
};

export { registerInternals };
