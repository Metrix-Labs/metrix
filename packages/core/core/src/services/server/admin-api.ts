import type { Core } from '@metrix/types';
import { createAPI } from './api';

const createAdminAPI = (metrix: Core.Strapi) => {
  const opts = {
    prefix: '', // '/admin';
    type: 'admin',
  };

  return createAPI(metrix, opts);
};

export { createAdminAPI };
