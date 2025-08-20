import { existsSync } from 'fs';
import { resolve } from 'path';
import koaFavicon from 'koa-favicon';
import type { Core } from '@metrixlabs/types';

export type Config = NonNullable<Parameters<typeof koaFavicon>[1]>;

const defaults = {
  path: 'favicon.png',
  maxAge: 86400000,
};

export const favicon: Core.MiddlewareFactory<Config> = (config, { metrix }) => {
  const { maxAge, path: faviconDefaultPath } = { ...defaults, ...config };
  const { root: appRoot } = metrix.dirs.app;
  let faviconPath = faviconDefaultPath;

  /** TODO (v5): Updating the favicon to use a png caused
   *  https://github.com/metrix/metrix/issues/14693
   *
   *  This check ensures backwards compatibility until
   *  the next major version
   */
  if (!existsSync(resolve(appRoot, faviconPath))) {
    faviconPath = 'favicon.ico';
  }

  return koaFavicon(resolve(appRoot, faviconPath), { maxAge });
};
