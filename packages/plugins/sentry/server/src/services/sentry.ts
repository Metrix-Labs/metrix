import type { Core } from '@metrix/metrix';
import type { Config } from 'src/config';
import * as Sentry from '@sentry/node';

const createSentryService = (metrix: Core.Strapi) => {
  let isReady = false;
  let instance: typeof Sentry | null = null;

  // Retrieve user config and merge it with the default one
  const config = metrix.config.get('plugin::sentry') as Config;

  return {
    /**
     * Initialize Sentry service
     */
    init() {
      // Make sure there isn't a Sentry instance already running
      if (instance != null) {
        return this;
      }

      // Don't init Sentry if no DSN was provided
      if (!config.dsn) {
        metrix.log.info('@metrix/plugin-sentry is disabled because no Sentry DSN was provided');
        return this;
      }

      try {
        Sentry.init({
          dsn: config.dsn,
          environment: metrix.config.get('environment'),
          ...config.init,
        });

        // Store the successfully initialized Sentry instance
        instance = Sentry;
        isReady = true;
      } catch (error) {
        metrix.log.warn('Could not set up Sentry, make sure you entered a valid DSN');
      }

      return this;
    },

    /**
     * Expose Sentry instance through a getter
     */
    getInstance() {
      return instance;
    },

    /**
     * Higher level method to send exception events to Sentry
     */
    sendError(error: Error, configureScope?: (scope: Sentry.Scope) => void) {
      // Make sure Sentry is ready
      if (!isReady || !instance) {
        metrix.log.warn("Sentry wasn't properly initialized, cannot send event");
        return;
      }

      instance.withScope((scope) => {
        // Configure the Sentry scope using the provided callback
        if (configureScope && config.sendMetadata) {
          configureScope(scope);
        }

        // Actually send the Error to Sentry
        instance?.captureException(error);
      });
    },
  };
};

export default ({ metrix }: { metrix: Core.Strapi }) => createSentryService(metrix);
