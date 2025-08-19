import { toString } from 'lodash/fp';
import { errors } from '@metrixlabs/utils';

const { ApplicationError } = errors;

const ssoCheckRolesIdForDeletion = async (ids: any) => {
  const adminStore = await metrix.store({ type: 'core', name: 'admin' });

  const {
    providers: { defaultRole },
  } = (await adminStore.get({ key: 'auth' })) as any;

  for (const roleId of ids) {
    if (defaultRole && toString(defaultRole) === toString(roleId)) {
      throw new ApplicationError(
        'This role is used as the default SSO role. Make sure to change this configuration before deleting the role'
      );
    }
  }
};

export default {
  ssoCheckRolesIdForDeletion,
};
