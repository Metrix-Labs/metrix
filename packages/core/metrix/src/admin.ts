import { RenderAdminArgs, renderAdmin } from '@metrix/admin/metrix-admin';
import contentTypeBuilder from '@metrix/content-type-builder/metrix-admin';
import contentManager from '@metrix/content-manager/metrix-admin';
import email from '@metrix/email/metrix-admin';
import upload from '@metrix/upload/metrix-admin';
import i18n from '@metrix/i18n/metrix-admin';
import contentReleases from '@metrix/content-releases/metrix-admin';
import reviewWorkflows from '@metrix/review-workflows/metrix-admin';

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

export * from '@metrix/admin/metrix-admin';

export {
  unstable_useDocumentLayout,
  unstable_useDocumentActions,
  unstable_useDocument,
  unstable_useContentManagerContext,
  useDocumentRBAC,
} from '@metrix/content-manager/metrix-admin';

export {
  private_useAutoReloadOverlayBlocker,
  private_AutoReloadOverlayBlockerProvider,
} from '@metrix/content-type-builder/metrix-admin';
