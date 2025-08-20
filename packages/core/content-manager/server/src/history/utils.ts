import type { Core } from '@metrixlabs/types';

type HistoryServices = typeof import('./services').services;

function getService<T extends keyof HistoryServices>(metrix: Core.Strapi, name: T) {
  // Cast is needed because the return type of metrix.service is too vague
  return metrix.service(`plugin::content-manager.${name}`) as ReturnType<HistoryServices[T]>;
}

export { getService };
