import type { Core } from '@metrixlabs/types';

export default (metrix: Core.Strapi) => {
  metrix.get('sanitizers').set('content-api', { input: [], output: [], query: [] });
};
