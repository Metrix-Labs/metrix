import { objectType, nonNull } from 'nexus';
import { defaultTo, prop, pipe } from 'lodash/fp';
import type { Schema } from '@metrixlabs/types';
import type { Context } from '../types';

export default ({ metrix }: Context) => {
  const { naming } = metrix.plugin('graphql').service('utils');

  return {
    /**
     * Build a type definition for a content API relation's collection response for a given content type
     */
    buildRelationResponseCollectionDefinition(contentType: Schema.ContentType) {
      const name = naming.getRelationResponseCollectionName(contentType);
      const typeName = naming.getTypeName(contentType);

      return objectType({
        name,

        definition(t) {
          t.nonNull.list.field('nodes', {
            type: nonNull(typeName),

            resolve: pipe(prop('nodes'), defaultTo([])),
          });

          if (metrix.plugin('graphql').config('v4CompatibilityMode', false)) {
            t.nonNull.list.field('data', {
              deprecation: 'Use `nodes` field instead',
              type: nonNull(typeName),
              resolve: pipe(prop('nodes'), defaultTo([])),
            });
          }
        },
      });
    },
  };
};
