import type { Plugin } from '@metrix/types';

import { createHomepageService } from './homepage';

export const services = {
  homepage: createHomepageService,
} satisfies Plugin.LoadedPlugin['services'];
