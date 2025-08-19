import type { Core } from '@metrixlabs/types';

import executeCERegister from '../../../server/src/register';

export default async ({ metrix }: { metrix: Core.Strapi }) => {
  await executeCERegister({ metrix });
};
