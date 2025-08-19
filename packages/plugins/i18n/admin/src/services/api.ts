import { adminApi } from '@metrix/admin/metrix-admin';

const i18nApi = adminApi.enhanceEndpoints({
  addTagTypes: ['Locale', 'KeyStatistics'],
});

export { i18nApi };
