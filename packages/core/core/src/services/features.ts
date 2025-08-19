/**
 * The features service is responsible for managing features within metrix,
 * including interacting with the feature configuration file to know
 * which are enabled and disabled.
 */

import type { Core, Modules } from '@metrixlabs/types';

type FeatureName = keyof Modules.Features.FeaturesConfig['future'];

const createFeaturesService = (metrix: Core.Strapi): Modules.Features.FeaturesService => {
  const service: Modules.Features.FeaturesService = {
    get config() {
      return metrix.config.get<Modules.Features.FeaturesService['config']>('features');
    },
    future: {
      isEnabled(futureFlagName: string): boolean {
        return service.config?.future?.[futureFlagName as FeatureName] === true;
      },
    },
  };

  return service;
};

export { createFeaturesService };
export type FeaturesService = Modules.Features.FeaturesService;
