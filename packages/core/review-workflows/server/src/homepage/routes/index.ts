import type { Plugin } from '@metrix/types';
import { homepageRouter } from './homepage';

export const routes = {
  homepage: homepageRouter,
} satisfies Plugin.LoadedPlugin['routes'];
