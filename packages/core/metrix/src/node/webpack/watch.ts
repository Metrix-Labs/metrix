import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { webpack } from 'webpack';
import type { Core } from '@metrixlabs/types';
import type { BuildContext } from '../create-build-context';
import { mergeConfigWithUserConfig, resolveDevelopmentConfig } from './config';

interface WebpackWatcher {
  close(): Promise<void>;
}

const watch = async (ctx: BuildContext): Promise<WebpackWatcher> => {
  const config = await resolveDevelopmentConfig(ctx);
  const finalConfig = await mergeConfigWithUserConfig(config, ctx);

  ctx.logger.debug('Final webpack config:', os.EOL, finalConfig);

  return new Promise<WebpackWatcher>((res) => {
    const compiler = webpack(finalConfig);

    if (!compiler) {
      throw new Error('Failed to create webpack compiler');
    }

    const devMiddleware = webpackDevMiddleware(compiler);

    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      path: '/__webpack_hmr',
    });

    ctx.metrix.server.app.use((ctx, next) => {
      return new Promise((resolve, reject) => {
        hotMiddleware(ctx.req, ctx.res, (err) => {
          if (err) reject(err);
          else resolve(next());
        });
      });
    });

    ctx.metrix.server.app.use((context, next) => {
      // wait for webpack-dev-middleware to signal that the build is ready
      const ready = new Promise((resolve) => {
        devMiddleware.waitUntilValid(() => {
          resolve(true);
        });
      });
      // tell webpack-dev-middleware to handle the request
      const init = new Promise((resolve) => {
        devMiddleware(
          context.req,
          {
            // @ts-expect-error ignored
            end(content) {
              // eslint-disable-next-line no-param-reassign
              context.body = content;
              resolve(true);
            },
            getHeader: context.get.bind(context),
            // @ts-expect-error ignored
            setHeader: context.set.bind(context),
            locals: context.state,
          },
          () => resolve(next())
        );
      });

      return Promise.all([ready, init]);
    });

    const serveAdmin: Core.MiddlewareHandler = async (ctx, next) => {
      await next();

      if (devMiddleware.context.outputFileSystem.createReadStream) {
        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
          return;
        }

        if (ctx.body != null || ctx.status !== 404) {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const filename = path.resolve(finalConfig.output?.path!, 'index.html');
        ctx.type = 'html';
        ctx.body = devMiddleware.context.outputFileSystem.createReadStream(filename);
      }
    };

    ctx.metrix.server.routes([
      {
        method: 'GET',
        path: `${ctx.adminPath}/:path*`,
        handler: serveAdmin,
        config: { auth: false },
      },
    ]);

    devMiddleware.waitUntilValid(() => {
      res({
        async close() {
          await Promise.all([
            promisify(devMiddleware.close.bind(devMiddleware))(),
            hotMiddleware.close(),
            compiler ? promisify(compiler.close.bind(compiler))() : Promise.resolve(),
          ]);
        },
      });
    });
  });
};

export { watch };
export type { WebpackWatcher };
