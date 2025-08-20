import type { Plugin } from '@metrixlabs/types';
import { homepageRouter } from './homepage';

export const routes = {
  homepage: homepageRouter,
} satisfies Plugin.LoadedPlugin['routes'];
