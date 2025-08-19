import { defaultsDeep } from 'lodash/fp';
import koaStatic from 'koa-static';
import type { Core } from '@metrix/types';

type Config = koaStatic.Options;

const defaults = {
  maxAge: 60000,
};

export const publicStatic: Core.MiddlewareFactory = (
  config: Config,
  { metrix }: { metrix: Core.Strapi }
) => {
  const { maxAge } = defaultsDeep(defaults, config);

  metrix.server.routes([
    {
      method: 'GET',
      path: '/',
      handler(ctx) {
        ctx.redirect(metrix.config.get('admin.url', '/admin'));
      },
      config: { auth: false },
    },
    // All other public GET-routes except /uploads/(.*) which is handled in upload middleware
    {
      method: 'GET',
      path: '/((?!uploads/).+)',
      handler: koaStatic(metrix.dirs.static.public, {
        maxage: maxAge,
        defer: true,
      }),
      config: { auth: false },
    },
  ]);
};
