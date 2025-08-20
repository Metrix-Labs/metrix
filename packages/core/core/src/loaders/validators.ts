import type { Core } from '@metrixlabs/types';

export default (metrix: Core.Strapi) => {
  metrix.get('validators').set('content-api', { input: [], query: [] });
};
