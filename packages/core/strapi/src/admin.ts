import { RenderAdminArgs, renderAdmin } from '@metrixlabs/admin/strapi-admin';
import contentTypeBuilder from '@metrixlabs/content-type-builder/strapi-admin';
import contentManager from '@metrixlabs/content-manager/strapi-admin';
import email from '@metrixlabs/email/strapi-admin';
import upload from '@metrixlabs/upload/strapi-admin';
import i18n from '@metrixlabs/i18n/strapi-admin';
import contentReleases from '@metrixlabs/content-releases/strapi-admin';
import reviewWorkflows from '@metrixlabs/review-workflows/strapi-admin';

const render = (mountNode: HTMLElement | null, { plugins, ...restArgs }: RenderAdminArgs) => {
  return renderAdmin(mountNode, {
    ...restArgs,
    plugins: {
      'content-manager': contentManager as any,
      'content-type-builder': contentTypeBuilder as any,
      email: email as any,
      upload: upload as any,
      contentReleases: contentReleases as any,
      i18n: i18n as any,
      reviewWorkflows: reviewWorkflows as any,
      ...plugins,
    },
  });
};

export { render as renderAdmin };
export type { RenderAdminArgs };

export * from '@metrixlabs/admin/strapi-admin';

export {
  unstable_useDocumentLayout,
  unstable_useDocumentActions,
  unstable_useDocument,
  unstable_useContentManagerContext,
  useDocumentRBAC,
} from '@metrixlabs/content-manager/strapi-admin';

export {
  private_useAutoReloadOverlayBlocker,
  private_AutoReloadOverlayBlockerProvider,
} from '@metrixlabs/content-type-builder/strapi-admin';
