import type { Core } from '@metrixlabs/types';

import { addDocumentMiddlewares } from './middlewares/documentation';

export async function register({ metrix }: { metrix: Core.Strapi }) {
  await addDocumentMiddlewares({ metrix });
}
