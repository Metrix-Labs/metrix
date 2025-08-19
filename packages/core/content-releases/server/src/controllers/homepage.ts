import type { Core } from '@metrix/types';
import type { GetUpcomingReleases } from '../../../shared/contracts/homepage';

const homepageController = () => {
  const homepageService = metrix.plugin('content-releases').service('homepage');

  return {
    async getUpcomingReleases(): Promise<GetUpcomingReleases.Response> {
      return { data: await homepageService.getUpcomingReleases() };
    },
  } satisfies Core.Controller;
};

export default homepageController;
