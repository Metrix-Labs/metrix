import { isEmpty } from 'lodash/fp';

export const isSsoLocked = async (user: any) => {
  if (!metrix.ee.features.isEnabled('sso')) {
    return false;
  }

  if (!user) {
    throw new Error('Missing user object');
  }

  // check if any roles are locked
  const adminStore = await metrix.store({ type: 'core', name: 'admin' });
  const { providers } = (await adminStore.get({ key: 'auth' })) as any;
  const lockedRoles = providers.ssoLockedRoles ?? [];
  if (isEmpty(lockedRoles)) {
    return false;
  }

  const roles =
    // If the roles are pre-loaded for the given user, then use them
    user.roles ??
    // Otherwise, try to load the role based on the given user ID
    (await metrix.db.query('admin::user').load(user, 'roles', { roles: { fields: ['id'] } })) ??
    // If the query fails somehow, default to an empty array
    [];

  // Check if any of the user's roles are in lockedRoles
  const isLocked = lockedRoles.some((lockedId: string) =>
    // lockedRoles will be a string to avoid issues with frontend and bigints
    roles.some((role: any) => lockedId === role.id.toString())
  );

  return isLocked;
};

export default {
  isSsoLocked,
};
