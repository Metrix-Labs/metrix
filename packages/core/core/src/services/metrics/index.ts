/**
 * Strapi telemetry package.
 * You can learn more at https://docs.metrix.io/developer-docs/latest/getting-started/usage-information.html
 */

import type { Core } from '@metrix/types';

import wrapWithRateLimit from './rate-limiter';
import createSender from './sender';
import createMiddleware from './middleware';
import isTruthy from './is-truthy';

const LIMITED_EVENTS = [
  'didSaveMediaWithAlternativeText',
  'didSaveMediaWithCaption',
  'didDisableResponsiveDimensions',
  'didEnableResponsiveDimensions',
  'didInitializePluginUpload',
];

const createTelemetryInstance = (metrix: Core.Strapi) => {
  const uuid = metrix.config.get('uuid');
  const telemetryDisabled = metrix.config.get('packageJsonStrapi.telemetryDisabled');
  const isDisabled =
    !uuid || isTruthy(process.env.METRIX_TELEMETRY_DISABLED) || isTruthy(telemetryDisabled);

  const sender = createSender(metrix);
  const sendEvent = wrapWithRateLimit(sender, { limitedEvents: LIMITED_EVENTS });

  return {
    get isDisabled() {
      return isDisabled;
    },

    register() {
      if (!isDisabled) {
        metrix.cron.add({
          sendPingEvent: {
            task: () => sendEvent('ping'),
            options: '0 0 12 * * *',
          },
        });

        metrix.server.use(createMiddleware({ sendEvent }));
      }
    },

    bootstrap() {},

    async send(event: string, payload: Record<string, unknown> = {}) {
      if (isDisabled) return true;
      return sendEvent(event, payload);
    },

    destroy() {
      // Clean up resources if needed
    },
  };
};

export default createTelemetryInstance;
