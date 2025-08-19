import type { Plugin } from '@metrix/types';
import { controllers } from './controllers';
import { services } from './services';
import { routes } from './routes';
import { getService } from './utils';
import { historyVersion } from './models/history-version';

/**
 * Check once if the feature is enabled before loading it,
 * so that we can assume it is enabled in the other files.
 */
const getFeature = (): Partial<Plugin.LoadedPlugin> => {
  if (metrix.ee.features.isEnabled('cms-content-history')) {
    return {
      register({ metrix }) {
        metrix.get('models').add(historyVersion);
      },
      bootstrap({ metrix }) {
        // Start recording history and saving history versions
        getService(metrix, 'lifecycles').bootstrap();
      },
      destroy({ metrix }) {
        getService(metrix, 'lifecycles').destroy();
      },
      controllers,
      services,
      routes,
    };
  }

  /**
   * Keep registering the model to avoid losing the data if the feature is disabled,
   * or if the license expires.
   */
  return {
    register({ metrix }) {
      metrix.get('models').add(historyVersion);
    },
  };
};

export default getFeature();
