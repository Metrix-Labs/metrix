import type { Core } from '@metrixlabs/types';

import { ProviderInitializationError } from '../errors/providers';

export type ValidStrapiAssertion = (metrix: unknown, msg?: string) => asserts metrix is Core.Strapi;

export const assertValidStrapi: ValidStrapiAssertion = (metrix?: unknown, msg = '') => {
  if (!metrix) {
    throw new ProviderInitializationError(`${msg}. Strapi instance not found.`);
  }
};
