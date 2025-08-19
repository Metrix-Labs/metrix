import { adminApi } from '@metrix/admin/metrix-admin';

const reviewWorkflowsApi = adminApi.enhanceEndpoints({
  addTagTypes: ['ReviewWorkflow', 'ReviewWorkflowStages', 'Document', 'ContentTypeSettings'],
});

export { reviewWorkflowsApi };
