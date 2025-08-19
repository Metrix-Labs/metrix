import { adminApi } from '@metrixlabs/admin/metrix-admin';

const reviewWorkflowsApi = adminApi.enhanceEndpoints({
  addTagTypes: ['ReviewWorkflow', 'ReviewWorkflowStages', 'Document', 'ContentTypeSettings'],
});

export { reviewWorkflowsApi };
