import type { Core } from '@metrix/types';
import registerAdminPanelRoute from './routes/serve-admin-panel';
import adminAuthStrategy from './strategies/admin';
import apiTokenAuthStrategy from './strategies/api-token';

export default ({ metrix }: { metrix: Core.Strapi }) => {
  const passportMiddleware = metrix.service('admin::passport').init();

  metrix.server.api('admin').use(passportMiddleware);
  metrix.get('auth').register('admin', adminAuthStrategy);
  metrix.get('auth').register('content-api', apiTokenAuthStrategy);

  if (metrix.config.get('admin.serveAdminPanel')) {
    registerAdminPanelRoute({ metrix });
  }
};
