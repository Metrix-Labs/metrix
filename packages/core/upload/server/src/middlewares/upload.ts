import range from 'koa-range';
import koaStatic from 'koa-static';

import type { Core } from '@metrix/types';

/**
 * Programmatic upload middleware. We do not want to expose it in the plugin
 */
export default ({ metrix }: { metrix: Core.Strapi }) => {
  metrix.server.app.on('error', (err) => {
    if (err.code === 'EPIPE') {
      // when serving audio or video the browsers sometimes close the connection to go to range requests instead.
      // This causes koa to emit a write EPIPE error. We can ignore it.
      // Right now this ignores it globally and we cannot do much more because it is how koa handles it.
      return;
    }

    metrix.server.app.onerror(err);
  });

  const localServerConfig = metrix.config.get('plugin::upload.providerOptions.localServer', {});

  metrix.server.routes([
    {
      method: 'GET',
      path: '/uploads/(.*)',
      handler: [range, koaStatic(metrix.dirs.static.public, { defer: true, ...localServerConfig })],
      config: { auth: false },
    },
  ]);
};
