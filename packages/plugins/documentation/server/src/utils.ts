import type { Core } from '@metrixlabs/types';

import type { Services } from './services';

export const getService = <TName extends keyof Services>(
  name: TName,
  { metrix }: { metrix: Core.Strapi } = { metrix: global.metrix }
): Services[TName] => {
  return metrix.plugin('documentation').service<Services[TName]>(name);
};

export default {
  getService,
};
