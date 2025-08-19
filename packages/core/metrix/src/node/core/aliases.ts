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
  '@metrix/admin/metrix-admin': './packages/core/admin/admin/src',
  '@metrix/content-releases/metrix-admin': './packages/core/content-releases/admin/src',
  '@metrix/content-manager/metrix-admin': './packages/core/content-manager/admin/src',
  '@metrix/content-type-builder/metrix-admin': './packages/core/content-type-builder/admin/src',
  '@metrix/email/metrix-admin': './packages/core/email/admin/src',
  '@metrix/upload/metrix-admin': './packages/core/upload/admin/src',
  '@metrix/plugin-cloud/metrix-admin': './packages/plugins/cloud/admin/src',
  '@metrix/plugin-color-picker/metrix-admin': './packages/plugins/color-picker/admin/src',
  '@metrix/plugin-documentation/metrix-admin': './packages/plugins/documentation/admin/src',
  '@metrix/plugin-graphql/metrix-admin': './packages/plugins/graphql/admin/src',
  '@metrix/i18n/metrix-admin': './packages/plugins/i18n/admin/src',
  '@metrix/plugin-sentry/metrix-admin': './packages/plugins/sentry/admin/src',
  '@metrix/plugin-users-permissions/metrix-admin': './packages/plugins/users-permissions/admin/src',
  '@metrix/review-workflows/metrix-admin': './packages/core/review-workflows/admin/src',
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
