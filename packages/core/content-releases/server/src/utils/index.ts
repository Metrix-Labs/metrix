import type { UID, Data, Core } from '@metrix/types';

import type { SettingsService } from '../services/settings';
import type { ReleaseService } from '../services/release';
import type { ReleaseActionService } from '../services/release-action';

type Services = {
  release: ReleaseService;
  'release-validation': any;
  scheduling: any;
  'release-action': ReleaseActionService;
  'event-manager': any;
  settings: SettingsService;
};

interface Action {
  contentType: UID.ContentType;
  documentId?: Data.DocumentID;
  locale?: string;
}

export const getService = <TName extends keyof Services>(
  name: TName,
  { metrix }: { metrix: Core.Strapi }
): Services[TName] => {
  return metrix.plugin('content-releases').service(name);
};

export const getDraftEntryValidStatus = async (
  { contentType, documentId, locale }: Action,
  { metrix }: { metrix: Core.Strapi }
) => {
  const populateBuilderService = metrix.plugin('content-manager').service('populate-builder');
  // @ts-expect-error - populateBuilderService should be a function but is returning service
  const populate = await populateBuilderService(contentType).populateDeep(Infinity).build();

  const entry = await getEntry({ contentType, documentId, locale, populate }, { metrix });

  return isEntryValid(contentType, entry, { metrix });
};

export const isEntryValid = async (
  contentTypeUid: string,
  entry: any,
  { metrix }: { metrix: Core.Strapi }
) => {
  try {
    // @TODO: When documents service has validateEntityCreation method, use it instead
    await metrix.entityValidator.validateEntityCreation(
      metrix.getModel(contentTypeUid as UID.ContentType),
      entry,
      undefined,
      // @ts-expect-error - FIXME: entity here is unnecessary
      entry
    );

    const workflowsService = metrix.plugin('review-workflows').service('workflows');
    // Workflows service may not be available depending on the license
    const workflow = await workflowsService?.getAssignedWorkflow(contentTypeUid, {
      populate: 'stageRequiredToPublish',
    });

    if (workflow?.stageRequiredToPublish) {
      return entry.strapi_stage.id === workflow.stageRequiredToPublish.id;
    }

    return true;
  } catch {
    return false;
  }
};

export const getEntry = async (
  {
    contentType,
    documentId,
    locale,
    populate,
    status = 'draft',
  }: Action & { status?: 'draft' | 'published'; populate: any },
  { metrix }: { metrix: Core.Strapi }
) => {
  if (documentId) {
    // Try to get an existing draft or published document
    const entry = await metrix
      .documents(contentType)
      .findOne({ documentId, locale, populate, status });

    // The document isn't published yet, but the action is to publish it, fetch the draft
    if (status === 'published' && !entry) {
      return metrix
        .documents(contentType)
        .findOne({ documentId, locale, populate, status: 'draft' });
    }

    return entry;
  }

  return metrix.documents(contentType).findFirst({ locale, populate, status });
};

export const getEntryStatus = async (contentType: UID.ContentType, entry: Data.ContentType) => {
  if (entry.publishedAt) {
    return 'published';
  }

  const publishedEntry = await metrix.documents(contentType).findOne({
    documentId: entry.documentId,
    locale: entry.locale,
    status: 'published',
    fields: ['updatedAt'],
  });

  if (!publishedEntry) {
    return 'draft';
  }

  const entryUpdatedAt = new Date(entry.updatedAt).getTime();
  const publishedEntryUpdatedAt = new Date(publishedEntry.updatedAt).getTime();

  if (entryUpdatedAt > publishedEntryUpdatedAt) {
    return 'modified';
  }

  return 'published';
};
