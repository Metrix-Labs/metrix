import crypto from 'crypto';
import type { Core } from '@metrixlabs/types';

/**
 * Generate an admin user hash
 */
const generateAdminUserHash = (metrix: Core.Strapi) => {
  const ctx = metrix?.requestContext?.get();

  if (!ctx?.state?.user?.email) {
    return '';
  }
  return crypto.createHash('sha256').update(ctx.state.user.email).digest('hex');
};

export { generateAdminUserHash };
