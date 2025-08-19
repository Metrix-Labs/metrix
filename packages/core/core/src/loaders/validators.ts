import type { Core } from '@metrix/types';

export default (metrix: Core.Strapi) => {
  metrix.get('validators').set('content-api', { input: [], query: [] });
};
