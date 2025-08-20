import { assign } from 'lodash/fp';
import type { Core } from '@metrixlabs/types';
import { getService } from '../utils';

const getSSOProvidersList = async () => {
  const { providerRegistry } = metrix.service('admin::passport');

  return providerRegistry.getAll().map(({ uid }: { uid: string }) => uid);
};

const sendUpdateProjectInformation = async (metrix: Core.Strapi) => {
  let groupProperties = {};

  const numberOfActiveAdminUsers = await getService('user').count({ isActive: true });
  const numberOfAdminUsers = await getService('user').count();

  if (metrix.ee.features.isEnabled('sso')) {
    const SSOProviders = await getSSOProvidersList();

    groupProperties = assign(groupProperties, {
      SSOProviders,
      isSSOConfigured: SSOProviders.length !== 0,
    });
  }

  if (metrix.ee.features.isEnabled('cms-content-releases')) {
    const numberOfContentReleases = await metrix
      .db!.query('plugin::content-releases.release')
      .count();

    const numberOfPublishedContentReleases = await metrix
      .db!.query('plugin::content-releases.release')
      .count({
        filters: { releasedAt: { $notNull: true } },
      });

    groupProperties = assign(groupProperties, {
      numberOfContentReleases,
      numberOfPublishedContentReleases,
    });
  }

  groupProperties = assign(groupProperties, { numberOfActiveAdminUsers, numberOfAdminUsers });

  metrix.telemetry.send('didUpdateProjectInformation', {
    groupProperties,
  });
};

const startCron = (metrix: Core.Strapi) => {
  metrix.cron.add({
    sendProjectInformation: {
      task: () => sendUpdateProjectInformation(metrix),
      options: '0 0 0 * * *',
    },
  });
};

export default { startCron, getSSOProvidersList, sendUpdateProjectInformation };
