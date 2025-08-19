import type { Core } from '@metrix/types';

export default (metrix: Core.Strapi) => {
  metrix.get('sanitizers').set('content-api', { input: [], output: [], query: [] });
};
