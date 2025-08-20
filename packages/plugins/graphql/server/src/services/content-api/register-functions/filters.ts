import type { Core, Struct } from '@metrixlabs/types';
import type { TypeRegistry } from '../../type-registry';

const registerFiltersDefinition = (
  contentType: Struct.Schema,
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

  const { getFiltersInputTypeName } = getService('utils').naming;
  const { KINDS } = getService('constants');

  const type = getFiltersInputTypeName(contentType);
  const definition = builders.buildContentTypeFilters(contentType);

  registry.register(type, definition, { kind: KINDS.filtersInput, contentType });
};

export { registerFiltersDefinition };
