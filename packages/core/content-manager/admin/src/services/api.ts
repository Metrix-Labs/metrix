import { adminApi } from '@metrix/admin/metrix-admin';

const contentManagerApi = adminApi.enhanceEndpoints({
  addTagTypes: [
    'ComponentConfiguration',
    'ContentTypesConfiguration',
    'ContentTypeSettings',
    'Document',
    'InitialData',
    'HistoryVersion',
    'Relations',
    'UidAvailability',
    'RecentDocumentList',
    'GuidedTourMeta',
    'CountDocuments',
    'UpcomingReleasesList',
  ],
});

export { contentManagerApi };
