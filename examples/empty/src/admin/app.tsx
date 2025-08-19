import type { StrapiApp } from '@metrix/metrix/admin';

export default {
  config: {
    locales: ['fr'],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
