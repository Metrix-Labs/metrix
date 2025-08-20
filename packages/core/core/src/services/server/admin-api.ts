import type { Core } from '@metrixlabs/types';
import { createAPI } from './api';

const createAdminAPI = (strapi: Core.Strapi) => {
  const opts = {
    prefix: '', // '/admin';
    type: 'admin',
  };

  return createAPI(strapi, opts);
};

export { createAdminAPI };
