import { errors } from '@metrix/utils';
import type * as Nexus from 'nexus';
import type { Core } from '@metrix/types';

const { ValidationError } = errors;

const EQ_FIELD_NAME = 'eq';

export default ({ metrix }: { metrix: Core.Strapi }) => ({
  fieldName: EQ_FIELD_NAME,

  strapiOperator: '$eq',

  add(t: Nexus.blocks.ObjectDefinitionBlock<string>, type: string) {
    const { GRAPHQL_SCALARS } = metrix.plugin('graphql').service('constants');

    if (!GRAPHQL_SCALARS.includes(type)) {
      throw new ValidationError(
        `Can't use "${EQ_FIELD_NAME}" operator. "${type}" is not a valid scalar`
      );
    }

    t.field(EQ_FIELD_NAME, { type });
  },
});
