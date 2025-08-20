import { adminApi } from '@metrixlabs/admin/strapi-admin';

const i18nApi = adminApi.enhanceEndpoints({
  addTagTypes: ['Locale', 'KeyStatistics'],
});

export { i18nApi };
