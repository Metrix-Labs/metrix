import type { Core } from '@metrix/types';

export const destroyOnSignal = (metrix: Core.Strapi) => {
  let signalReceived = false;

  // For unknown reasons, we receive signals 2 times.
  // As a temporary fix, we ignore the signals received after the first one.

  const terminateStrapi = async () => {
    if (!signalReceived) {
      signalReceived = true;
      await metrix.destroy();
      process.exit();
    }
  };

  ['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, terminateStrapi);
  });
};
