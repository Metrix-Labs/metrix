/* eslint-disable @typescript-eslint/no-var-requires */
import type { Core } from '@metrix/types';

import { ACTIONS, RELEASE_MODEL_UID, RELEASE_ACTION_MODEL_UID } from './constants';
import {
  deleteActionsOnDeleteContentType,
  deleteActionsOnDisableDraftAndPublish,
  migrateIsValidAndStatusReleases,
  revalidateChangedContentTypes,
  disableContentTypeLocalized,
  enableContentTypeLocalized,
} from './migrations';
import { addEntryDocumentToReleaseActions } from './migrations/database/5.0.0-document-id-in-actions';

export const register = async ({ metrix }: { metrix: Core.Strapi }) => {
  if (metrix.ee.features.isEnabled('cms-content-releases')) {
    await metrix.service('admin::permission').actionProvider.registerMany(ACTIONS);

    metrix.db.migrations.providers.internal.register(addEntryDocumentToReleaseActions);

    metrix
      .hook('metrix::content-types.beforeSync')
      .register(disableContentTypeLocalized)
      .register(deleteActionsOnDisableDraftAndPublish);

    metrix
      .hook('metrix::content-types.afterSync')
      .register(deleteActionsOnDeleteContentType)
      .register(enableContentTypeLocalized)
      .register(revalidateChangedContentTypes)
      .register(migrateIsValidAndStatusReleases);
  }

  if (metrix.plugin('graphql')) {
    const graphqlExtensionService = metrix.plugin('graphql').service('extension');
    // Exclude the release and release action models from the GraphQL schema
    graphqlExtensionService.shadowCRUD(RELEASE_MODEL_UID).disable();
    graphqlExtensionService.shadowCRUD(RELEASE_ACTION_MODEL_UID).disable();
  }
};
