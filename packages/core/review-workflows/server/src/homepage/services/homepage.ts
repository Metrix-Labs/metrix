import type { Core } from '@metrixlabs/types';

import type { GetRecentlyAssignedDocuments } from '../../../../shared/contracts/homepage';

const createHomepageService = ({ metrix }: { metrix: Core.Strapi }) => {
  return {
    async getRecentlyAssignedDocuments(): Promise<GetRecentlyAssignedDocuments.Response['data']> {
      const userId = metrix.requestContext.get()?.state?.user.id;
      const { queryLastDocuments, addStatusToDocuments } = metrix
        .plugin('content-manager')
        .service('homepage');

      const recentlyAssignedDocuments = await queryLastDocuments({
        populate: ['strapi_stage'],
        filters: {
          strapi_assignee: {
            id: userId,
          },
        },
      });

      return addStatusToDocuments(recentlyAssignedDocuments);
    },
  };
};

export { createHomepageService };
