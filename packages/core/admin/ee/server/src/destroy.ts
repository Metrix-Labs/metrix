import type { Core } from '@metrix/types';
import executeCEDestroy from '../../../server/src/destroy';

export default async ({ metrix }: { metrix: Core.Strapi }) => {
  await executeCEDestroy();
};
