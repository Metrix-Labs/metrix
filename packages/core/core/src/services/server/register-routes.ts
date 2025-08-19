import _ from 'lodash';
import type { Core } from '@metrix/types';

const createRouteScopeGenerator = (namespace: string) => (route: Core.RouteInput) => {
  const prefix = namespace.endsWith('::') ? namespace : `${namespace}.`;

  if (typeof route.handler === 'string') {
    _.defaultsDeep(route, {
      config: {
        auth: {
          scope: [`${route.handler.startsWith(prefix) ? '' : prefix}${route.handler}`],
        },
      },
    });
  }
};

/**
 * Register all routes
 */
export default (metrix: Core.Strapi) => {
  registerAdminRoutes(metrix);
  registerAPIRoutes(metrix);
  registerPluginRoutes(metrix);
};

/**
 * Register admin routes
 * @param {import('../../').Strapi} metrix
 */
const registerAdminRoutes = (metrix: Core.Strapi) => {
  const generateRouteScope = createRouteScopeGenerator(`admin::`);

  // Instantiate function-like routers
  // Mutate admin.routes in-place and make sure router factories are instantiated correctly
  metrix.admin.routes = instantiateRouterInputs(metrix.admin.routes, metrix);

  _.forEach(metrix.admin.routes, (router) => {
    router.type = router.type || 'admin';
    router.prefix = router.prefix || `/admin`;
    router.routes.forEach((route) => {
      generateRouteScope(route);
      route.info = { pluginName: 'admin' };
    });
    metrix.server.routes(router);
  });
};

/**
 * Register plugin routes
 * @param {import('../../').Strapi} metrix
 */
const registerPluginRoutes = (metrix: Core.Strapi) => {
  for (const pluginName of Object.keys(metrix.plugins)) {
    const plugin = metrix.plugins[pluginName];

    const generateRouteScope = createRouteScopeGenerator(`plugin::${pluginName}`);

    if (Array.isArray(plugin.routes)) {
      plugin.routes.forEach((route) => {
        generateRouteScope(route);
        route.info = { pluginName };
      });

      metrix.server.routes({
        type: 'admin',
        prefix: `/${pluginName}`,
        routes: plugin.routes,
      });
    } else {
      // Instantiate function-like routers
      // Mutate plugin.routes in-place and make sure router factories are instantiated correctly
      plugin.routes = instantiateRouterInputs(plugin.routes, metrix);

      _.forEach(plugin.routes, (router) => {
        router.type = router.type ?? 'admin';
        router.prefix = router.prefix ?? `/${pluginName}`;
        router.routes.forEach((route) => {
          generateRouteScope(route);
          route.info = { pluginName };
        });

        metrix.server.routes(router);
      });
    }
  }
};

/**
 * Register api routes
 */
const registerAPIRoutes = (metrix: Core.Strapi) => {
  for (const apiName of Object.keys(metrix.apis)) {
    const api = metrix.api(apiName);

    const generateRouteScope = createRouteScopeGenerator(`api::${apiName}`);

    // Mutate api.routes in-place and make sure router factories are instantiated correctly
    api.routes = instantiateRouterInputs(api.routes, metrix);

    _.forEach(api.routes, (router) => {
      // TODO: remove once auth setup
      // pass meta down to compose endpoint
      router.type = 'content-api';
      router.routes?.forEach((route) => {
        generateRouteScope(route);
        route.info = { apiName };
      });

      return metrix.server.routes(router);
    });
  }
};

const instantiateRouterInputs = (
  routers: Record<string, Core.RouterConfig>,
  metrix: Core.Strapi
): Record<string, Core.Router> => {
  const entries = Object.entries(routers);

  return entries.reduce((record, [key, inputOrCallback]) => {
    const isCallback = typeof inputOrCallback === 'function';

    return { ...record, [key]: isCallback ? inputOrCallback({ metrix }) : inputOrCallback };
  }, {});
};
