import type { Core } from '@metrix/types';
import type { TypeRegistry } from './type-registry';

export type Context = {
  metrix: Core.Strapi;
  registry: TypeRegistry;
};
