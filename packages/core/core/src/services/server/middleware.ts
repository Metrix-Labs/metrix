import path from 'path';
import { isArray } from 'lodash/fp';
import { importDefault } from '@metrix/utils';
import type { Core } from '@metrix/types';

const instantiateMiddleware = (
  middlewareFactory: Core.MiddlewareFactory,
  name: string,
  config: unknown,
  metrix: Core.Strapi
) => {
  try {
    return middlewareFactory(config, { metrix });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Middleware "${name}": ${e.message}`);
    }
  }
};

const resolveRouteMiddlewares = (route: Core.Route, metrix: Core.Strapi) => {
  const middlewaresConfig = route?.config?.middlewares ?? [];

  if (!isArray(middlewaresConfig)) {
    throw new Error('Route middlewares config must be an array');
  }

  const middlewares = resolveMiddlewares(middlewaresConfig, metrix);

  return middlewares.map(({ handler }) => handler);
};

const dummyMiddleware: Core.MiddlewareHandler = (_, next) => next();

/**
 * Initialize every configured middlewares
 */
const resolveMiddlewares = (
  config: Array<Core.MiddlewareName | Core.MiddlewareConfig | Core.MiddlewareHandler>,
  metrix: Core.Strapi
) => {
  const middlewares: {
    name: string | null;
    handler: Core.MiddlewareHandler;
  }[] = [];

  for (const item of config) {
    if (typeof item === 'function') {
      middlewares.push({
        name: null,
        handler: item,
      });

      continue;
    }

    if (typeof item === 'string') {
      const middlewareFactory = metrix.middleware(item);

      if (!middlewareFactory) {
        throw new Error(`Middleware ${item} not found.`);
      }

      middlewares.push({
        name: item,
        handler: instantiateMiddleware(middlewareFactory, item, {}, metrix) ?? dummyMiddleware,
      });

      continue;
    }

    if (typeof item === 'object' && item !== null) {
      const { name, resolve, config = {} } = item;

      if (name) {
        const middlewareFactory = metrix.middleware(name);
        middlewares.push({
          name,
          handler:
            instantiateMiddleware(middlewareFactory, name, config, metrix) ?? dummyMiddleware,
        });

        continue;
      }

      if (resolve) {
        const resolvedMiddlewareFactory = resolveCustomMiddleware(resolve, metrix);
        middlewares.push({
          name: resolve,
          handler:
            instantiateMiddleware(resolvedMiddlewareFactory, resolve, config, metrix) ??
            dummyMiddleware,
        });

        continue;
      }

      throw new Error('Invalid middleware configuration. Missing name or resolve properties.');
    }

    throw new Error(
      'Middleware config must either be a string or an object {name?: string, resolve?: string, config: any}.'
    );
  }

  return middlewares;
};

/**
 * Resolve middleware from package name or path
 */
const resolveCustomMiddleware = (resolve: string, metrix: Core.Strapi) => {
  let modulePath;

  try {
    modulePath = require.resolve(resolve);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'MODULE_NOT_FOUND') {
      modulePath = path.resolve(metrix.dirs.dist.root, resolve);
    } else {
      throw error;
    }
  }

  try {
    return importDefault(modulePath);
  } catch (err) {
    throw new Error(`Could not load middleware "${modulePath}".`);
  }
};

export { resolveRouteMiddlewares, resolveMiddlewares };
