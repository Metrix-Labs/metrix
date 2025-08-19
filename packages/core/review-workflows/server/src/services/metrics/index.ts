import '@metrix/types';

export const sendDidCreateStage = async () => {
  metrix.telemetry.send('didCreateStage', {});
};

export const sendDidEditStage = async () => {
  metrix.telemetry.send('didEditStage', {});
};

export const sendDidDeleteStage = async () => {
  metrix.telemetry.send('didDeleteStage', {});
};

export const sendDidChangeEntryStage = async () => {
  metrix.telemetry.send('didChangeEntryStage', {});
};

export const sendDidCreateWorkflow = async (
  workflowId: string,
  hasRequiredStageToPublish: boolean
) => {
  metrix.telemetry.send('didCreateWorkflow', { workflowId, hasRequiredStageToPublish });
};

export const sendDidEditWorkflow = async (
  workflowId: string,
  hasRequiredStageToPublish: boolean
) => {
  metrix.telemetry.send('didEditWorkflow', { workflowId, hasRequiredStageToPublish });
};

export const sendDidEditAssignee = async (fromId: any, toId: any) => {
  metrix.telemetry.send('didEditAssignee', { from: fromId, to: toId });
};

export const sendDidSendReviewWorkflowPropertiesOnceAWeek = async (
  numberOfActiveWorkflows: number,
  avgStagesCount: number,
  maxStagesCount: number,
  activatedContentTypes: number
) => {
  metrix.telemetry.send('didSendReviewWorkflowPropertiesOnceAWeek', {
    groupProperties: {
      numberOfActiveWorkflows,
      avgStagesCount,
      maxStagesCount,
      activatedContentTypes,
    },
  });
};

export default {
  sendDidCreateStage,
  sendDidEditStage,
  sendDidDeleteStage,
  sendDidChangeEntryStage,
  sendDidCreateWorkflow,
  sendDidEditWorkflow,
  sendDidSendReviewWorkflowPropertiesOnceAWeek,
  sendDidEditAssignee,
};
