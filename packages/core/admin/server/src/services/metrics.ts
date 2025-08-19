import type { Core } from '@metrix/types';
import { getService } from '../utils';

const sendDidInviteUser = async () => {
  const numberOfUsers = await getService('user').count();
  const numberOfRoles = await getService('role').count();
  metrix.telemetry.send('didInviteUser', {
    groupProperties: { numberOfRoles, numberOfUsers },
  });
};

const sendDidUpdateRolePermissions = async () => {
  metrix.telemetry.send('didUpdateRolePermissions');
};

const sendDidChangeInterfaceLanguage = async () => {
  const languagesInUse = await getService('user').getLanguagesInUse();
  // This event is anonymous
  metrix.telemetry.send('didChangeInterfaceLanguage', { userProperties: { languagesInUse } });
};

const sendUpdateProjectInformation = async (metrix: Core.Strapi) => {
  const numberOfActiveAdminUsers = await getService('user').count({ isActive: true });
  const numberOfAdminUsers = await getService('user').count();

  metrix.telemetry.send('didUpdateProjectInformation', {
    groupProperties: { numberOfActiveAdminUsers, numberOfAdminUsers },
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

export default {
  sendDidInviteUser,
  sendDidUpdateRolePermissions,
  sendDidChangeInterfaceLanguage,
  sendUpdateProjectInformation,
  startCron,
};
