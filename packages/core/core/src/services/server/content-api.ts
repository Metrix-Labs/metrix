import type { Core } from '@metrix/types';
import { createAPI } from './api';

const createContentAPI = (metrix: Core.Strapi) => {
  const opts = {
    prefix: metrix.config.get('api.rest.prefix', '/api'),
    type: 'content-api',
  };

  return createAPI(metrix, opts);
};

export { createContentAPI };
