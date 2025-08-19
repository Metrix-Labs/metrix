import type { Core } from '@metrixlabs/types';

export const getService = (
  name: string,
  { metrix }: { metrix: Core.Strapi } = { metrix: global.metrix }
) => {
  return metrix.service(`admin::${name}`);
};

export default {
  getService,
};
