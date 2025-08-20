import { env } from '@metrixlabs/utils';

export const apiConfig = {
  apiBaseUrl: env('STRAPI_CLI_CLOUD_API', 'https://cloud-cli-api.metrix.io'),
  dashboardBaseUrl: env('STRAPI_CLI_CLOUD_DASHBOARD', 'https://cloud.metrix.io'),
};
