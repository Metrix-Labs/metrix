import type { Core, Struct } from '@metrixlabs/types';
import type { TypeRegistry } from '../../type-registry';

const registerComponent = (
  contentType: Struct.ComponentSchema,
  {
    registry,
    metrix,
    builders,
  }: {
    registry: TypeRegistry;
    metrix: Core.Strapi;
    builders: any;
  }
) => {
  const { service: getService } = metrix.plugin('graphql');

  const { getComponentName } = getService('utils').naming;
  const { KINDS } = getService('constants');

  const name = getComponentName(contentType);
  const definition = builders.buildTypeDefinition(contentType);

  registry.register(name, definition, { kind: KINDS.component, contentType });
};

export { registerComponent };
