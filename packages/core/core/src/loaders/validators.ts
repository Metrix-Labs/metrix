import type { Core } from '@metrixlabs/types';

export default (strapi: Core.Strapi) => {
  strapi.get('validators').set('content-api', { input: [], query: [] });
};
