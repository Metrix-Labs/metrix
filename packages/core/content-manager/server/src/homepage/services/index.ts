import type { Plugin } from '@metrixlabs/types';

import { createHomepageService } from './homepage';

export const services = {
  homepage: createHomepageService,
} satisfies Plugin.LoadedPlugin['services'];
