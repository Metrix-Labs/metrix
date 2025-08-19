import _ from 'lodash';
import type { Core, Struct } from '@metrix/types';
import { getGlobalId } from '../domain/content-type';

export default async function loadAdmin(metrix: Core.Strapi) {
  metrix.get('services').add(`admin::`, metrix.admin?.services);
  metrix.get('controllers').add(`admin::`, metrix.admin?.controllers);
  metrix.get('content-types').add(`admin::`, formatContentTypes(metrix.admin?.contentTypes ?? {}));
  metrix.get('policies').add(`admin::`, metrix.admin?.policies);
  metrix.get('middlewares').add(`admin::`, metrix.admin?.middlewares);

  const userAdminConfig = metrix.config.get('admin');
  metrix.get('config').set('admin', _.merge(metrix.admin?.config, userAdminConfig));
}

const formatContentTypes = (contentTypes: Record<string, { schema: Struct.ContentTypeSchema }>) => {
  Object.values(contentTypes).forEach((definition) => {
    const { schema } = definition;

    Object.assign(schema, {
      plugin: 'admin',
      globalId: getGlobalId(schema, 'admin'),
    });
  });

  return contentTypes;
};
