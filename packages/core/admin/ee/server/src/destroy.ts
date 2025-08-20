import type { Core } from '@metrixlabs/types';
import executeCEDestroy from '../../../server/src/destroy';

export default async ({ metrix }: { metrix: Core.Strapi }) => {
  await executeCEDestroy();
};
