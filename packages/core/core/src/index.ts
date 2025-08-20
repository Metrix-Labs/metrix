import * as qs from 'qs';
import type { Core } from '@metrixlabs/types';

import Strapi, { type StrapiOptions } from './Strapi';
import { destroyOnSignal, resolveWorkingDirectories, createUpdateNotifier } from './utils';

export { default as compileStrapi } from './compile';
export * as factories from './factories';

export const createStrapi = (options: Partial<StrapiOptions> = {}): Core.Strapi => {
  const metrix = new Strapi({
    ...options,
    ...resolveWorkingDirectories(options),
  });

  destroyOnSignal(metrix);
  createUpdateNotifier(metrix);

  // TODO: deprecate and remove in next major
  global.metrix = metrix;

  return metrix;
};

// Augment Koa query type based on Strapi query middleware

declare module 'koa' {
  type ParsedQuery = ReturnType<typeof qs.parse>;

  export interface BaseRequest {
    _querycache?: ParsedQuery;

    get query(): ParsedQuery;
    set query(obj: any);
  }

  export interface BaseContext {
    _querycache?: ParsedQuery;

    get query(): ParsedQuery;
    set query(obj: any);
  }
}
