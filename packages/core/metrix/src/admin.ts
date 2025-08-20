import { RenderAdminArgs, renderAdmin } from '@metrixlabs/admin/metrix-admin';
import contentTypeBuilder from '@metrixlabs/content-type-builder/metrix-admin';
import contentManager from '@metrixlabs/content-manager/metrix-admin';
import email from '@metrixlabs/email/metrix-admin';
import upload from '@metrixlabs/upload/metrix-admin';
import i18n from '@metrixlabs/i18n/metrix-admin';
import contentReleases from '@metrixlabs/content-releases/metrix-admin';
import reviewWorkflows from '@metrixlabs/review-workflows/metrix-admin';

const render = (mountNode: HTMLElement | null, { plugins, ...restArgs }: RenderAdminArgs) => {
  return renderAdmin(mountNode, {
    ...restArgs,
    plugins: {
      'content-manager': contentManager,
      'content-type-builder': contentTypeBuilder,
      email,
      upload,
      contentReleases,
      i18n,
      reviewWorkflows,
      ...plugins,
    },
  });
};

export { render as renderAdmin };
export type { RenderAdminArgs };

export * from '@metrixlabs/admin/metrix-admin';

export {
  unstable_useDocumentLayout,
  unstable_useDocumentActions,
  unstable_useDocument,
  unstable_useContentManagerContext,
  useDocumentRBAC,
} from '@metrixlabs/content-manager/metrix-admin';

export {
  private_useAutoReloadOverlayBlocker,
  private_AutoReloadOverlayBlockerProvider,
} from '@metrixlabs/content-type-builder/metrix-admin';
