import _ from 'lodash';
import type { Core } from '@metrix/types';

import validateLocaleCreation from './controllers/validate-locale-creation';
import graphqlProvider from './graphql';
import { getService } from './utils';

export default ({ metrix }: { metrix: Core.Strapi }) => {
  extendContentTypes(metrix);
  addContentManagerLocaleMiddleware(metrix);
};

// TODO: v5 if implemented in the CM => delete this middleware
/**
 * Adds middleware on CM creation routes to use i18n locale passed in a specific param
 * @param {Strapi} metrix
 */
const addContentManagerLocaleMiddleware = (metrix: Core.Strapi) => {
  metrix.server.router.use('/content-manager/collection-types/:model', (ctx, next) => {
    if (ctx.method === 'POST' || ctx.method === 'PUT') {
      return validateLocaleCreation(ctx, next);
    }

    return next();
  });

  metrix.server.router.use('/content-manager/single-types/:model', (ctx, next) => {
    if (ctx.method === 'POST' || ctx.method === 'PUT') {
      return validateLocaleCreation(ctx, next);
    }

    return next();
  });
};

/**
 * Adds locale and localization fields to all content types
 * Even if content type is not localized, it will have these fields
 * @param {Strapi} metrix
 */
const extendContentTypes = (metrix: Core.Strapi) => {
  const { isLocalizedContentType } = getService('content-types');

  Object.values(metrix.contentTypes).forEach((contentType) => {
    const { attributes } = contentType;

    const isLocalized = isLocalizedContentType(contentType);

    _.set(attributes, 'locale', {
      writable: true,
      private: !isLocalized,
      configurable: false,
      visible: false,
      type: 'string',
    });

    _.set(attributes, 'localizations', {
      type: 'relation',
      relation: 'oneToMany',
      target: contentType.uid,
      writable: false,
      private: !isLocalized,
      configurable: false,
      visible: false,
      unstable_virtual: true,
      joinColumn: {
        name: 'document_id',
        referencedColumn: 'document_id',
        referencedTable: metrix.db.metadata.identifiers.getTableName(contentType.collectionName!),
        // ensure the population will not include the results we already loaded
        on({ results }: { results: any[] }) {
          return {
            id: {
              $notIn: results.map((r) => r.id),
            },
          };
        },
      },
    });
  });

  if (metrix.plugin('graphql')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    graphqlProvider({ metrix }).register();
  }
};
