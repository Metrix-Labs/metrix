import type { Core } from '@metrix/types';

export const getAdminService = (
  name: string,
  { metrix }: { metrix: Core.Strapi } = { metrix: global.metrix }
) => {
  return metrix.service(`admin::${name}`);
};

export const getService = (name: string, { metrix } = { metrix: global.metrix }) => {
  return metrix.plugin('review-workflows').service(name);
};

export default {
  getAdminService,
  getService,
};
