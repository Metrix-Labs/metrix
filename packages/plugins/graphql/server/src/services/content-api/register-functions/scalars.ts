import type { Context } from '../../types';

const registerScalars = ({ registry, metrix }: Context) => {
  const { service: getService } = metrix.plugin('graphql');

  const { scalars } = getService('internals');
  const { KINDS } = getService('constants');

  Object.entries(scalars).forEach(([name, definition]) => {
    registry.register(name, definition, { kind: KINDS.scalar });
  });
};

export { registerScalars };
