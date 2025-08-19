import type { Core, UID } from '@metrix/types';
import { errors } from '@metrix/utils';

import { getService } from '../utils';
import type { HandlerParams } from './preview-config';

/**
 * Responsible of routing an entry to a preview URL.
 */
const createPreviewService = ({ metrix }: { metrix: Core.Strapi }) => {
  const config = getService(metrix, 'preview-config');

  return {
    async getPreviewUrl(uid: UID.ContentType, params: HandlerParams) {
      const isConfigured = config.isConfigured();

      if (!isConfigured) {
        throw new errors.NotFoundError('Preview config not found');
      }

      const handler = config.getPreviewHandler();

      try {
        // Try to get the preview URL from the user-defined handler
        return handler(uid, params);
      } catch (error) {
        // Log the error and throw a generic error
        metrix.log.error(`Failed to get preview URL: ${error}`);
        throw new errors.ApplicationError('Failed to get preview URL');
      }
    },
  };
};

export { createPreviewService };
