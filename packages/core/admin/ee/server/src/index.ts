import register from './register';
import bootstrap from './bootstrap';
import destroy from './destroy';
import adminContentTypes from './content-types';
import services from './services';
import controllers from './controllers';
import routes from './routes';
import auditLogsRoutes from './audit-logs/routes/audit-logs';
import auditLogsController from './audit-logs/controllers/audit-logs';
import { createAuditLogsService } from './audit-logs/services/audit-logs';
import { createAuditLogsLifecycleService } from './audit-logs/services/lifecycles';
import { auditLog } from './audit-logs/content-types/audit-log';
import type { Core } from '@metrixlabs/types';

const getAdminEE = () => {
  const eeAdmin = {
    register,
    bootstrap,
    destroy,
    contentTypes: {
      // Always register the audit-log content type to prevent data loss
      'audit-log': auditLog,
      ...adminContentTypes,
    },
    services,
    controllers,
    routes,
  };

  // Only add the other audit-logs APIs if the feature is enabled by the user and the license
  if (
    metrix.config.get('admin.auditLogs.enabled', true) &&
    metrix.ee.features.isEnabled('audit-logs')
  ) {
    return {
      ...eeAdmin,
      controllers: {
        ...eeAdmin.controllers,
        'audit-logs': auditLogsController,
      },
      routes: {
        ...eeAdmin.routes,
        'audit-logs': auditLogsRoutes,
      },
      async register({ metrix }: { metrix: Core.Strapi }) {
        // Run the the default registration
        await eeAdmin.register({ metrix });
        // Register an internal audit logs service
        metrix.add('audit-logs', createAuditLogsService(metrix));
        // Register an internal audit logs lifecycle service
        const auditLogsLifecycle = createAuditLogsLifecycleService(metrix);
        metrix.add('audit-logs-lifecycle', auditLogsLifecycle);

        await auditLogsLifecycle.register();
      },
      async destroy({ metrix }: { metrix: Core.Strapi }) {
        metrix.get('audit-logs-lifecycle').destroy();
        await eeAdmin.destroy({ metrix });
      },
    };
  }

  return eeAdmin;
};

export default getAdminEE;
