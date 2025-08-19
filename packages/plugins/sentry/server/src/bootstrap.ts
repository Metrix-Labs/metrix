import type { Core } from '@metrix/metrix';
import initSentryMiddleware from './middlewares/sentry';

export default async ({ metrix }: { metrix: Core.Strapi }) => {
  // Initialize the Sentry service exposed by this plugin
  initSentryMiddleware({ metrix });
};
