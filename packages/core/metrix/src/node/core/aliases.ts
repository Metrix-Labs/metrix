import path from 'node:path';
import { StrapiMonorepo } from './monorepo';

/**
 * The path mappings/aliases used by various tools in the monorepo to map imported modules to
 * source files in order to speed up rebuilding and avoid having a separate watcher process to build
 * from `src` to `lib`.
 *
 * This file is currently read by:
 * - Webpack when running the dev server (only when running in this monorepo)
 */
const devAliases: Record<string, string> = {
  '@metrixlabs/admin/metrix-admin': './packages/core/admin/admin/src',
  '@metrixlabs/content-releases/metrix-admin': './packages/core/content-releases/admin/src',
  '@metrixlabs/content-manager/metrix-admin': './packages/core/content-manager/admin/src',
  '@metrixlabs/content-type-builder/metrix-admin': './packages/core/content-type-builder/admin/src',
  '@metrixlabs/email/metrix-admin': './packages/core/email/admin/src',
  '@metrixlabs/upload/metrix-admin': './packages/core/upload/admin/src',
  '@metrixlabs/plugin-cloud/metrix-admin': './packages/plugins/cloud/admin/src',
  '@metrixlabs/plugin-color-picker/metrix-admin': './packages/plugins/color-picker/admin/src',
  '@metrixlabs/plugin-documentation/metrix-admin': './packages/plugins/documentation/admin/src',
  '@metrixlabs/plugin-graphql/metrix-admin': './packages/plugins/graphql/admin/src',
  '@metrixlabs/i18n/metrix-admin': './packages/plugins/i18n/admin/src',
  '@metrixlabs/plugin-sentry/metrix-admin': './packages/plugins/sentry/admin/src',
  '@metrixlabs/plugin-users-permissions/metrix-admin': './packages/plugins/users-permissions/admin/src',
  '@metrixlabs/review-workflows/metrix-admin': './packages/core/review-workflows/admin/src',
};

const getMonorepoAliases = ({ monorepo }: { monorepo?: StrapiMonorepo }) => {
  if (!monorepo?.path) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(devAliases).map(([key, modulePath]) => {
      return [key, path.join(monorepo.path, modulePath)];
    })
  );
};

export { getMonorepoAliases };
