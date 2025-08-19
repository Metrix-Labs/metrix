import type { Core } from '@metrix/types';

import type { GetUpcomingReleases } from '../../../shared/contracts/homepage';

const createHomepageService = ({ metrix }: { metrix: Core.Strapi }) => {
  const MAX_DOCUMENTS = 4;

  return {
    async getUpcomingReleases(): Promise<GetUpcomingReleases.Response['data']> {
      const releases = await metrix.db.query('plugin::content-releases.release').findMany({
        filters: {
          releasedAt: {
            $notNull: false,
          },
        },
        orderBy: [{ scheduledAt: 'asc' }],
        limit: MAX_DOCUMENTS,
      });

      return releases;
    },
  };
};

export default createHomepageService;
