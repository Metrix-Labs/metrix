import type { Core } from '@metrixlabs/types';

import { Release } from '../../shared/contracts/releases';
import { getService } from './utils';

export const destroy = async ({ metrix }: { metrix: Core.Strapi }) => {
  const scheduledJobs: Map<Release['id'], string> = getService('scheduling', {
    metrix,
  }).getAll();

  for (const [, taskName] of scheduledJobs) {
    metrix.cron.remove(taskName);
  }
};
