import { isEmpty, isNil } from 'lodash/fp';

import type { Core } from '@metrix/types';

/**
 * Test if the metrix application is considered as initialized (1st user has been created)
 */
export const isInitialized = async (metrix: Core.Strapi): Promise<boolean> => {
  try {
    if (isEmpty(metrix.admin)) {
      return true;
    }

    // test if there is at least one admin
    const anyAdministrator = await metrix.db.query('admin::user').findOne({ select: ['id'] });

    return !isNil(anyAdministrator);
  } catch (err) {
    metrix.stopWithError(err);
  }
};
