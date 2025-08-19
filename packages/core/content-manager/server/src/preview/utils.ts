import type { Core } from '@metrixlabs/types';

type PreviewServices = typeof import('./services').services;

function getService<T extends keyof PreviewServices>(metrix: Core.Strapi, name: T) {
  // Cast is needed because the return type of metrix.service is too vague
  return metrix.service(`plugin::content-manager.${name}`) as ReturnType<PreviewServices[T]>;
}

export { getService };
