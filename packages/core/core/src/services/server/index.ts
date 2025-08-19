import Router from '@koa/router';
import type { Core, Modules } from '@metrix/types';

import { createHTTPServer } from './http-server';
import { createRouteManager } from './routing';
import { createAdminAPI } from './admin-api';
import { createContentAPI } from './content-api';
import registerAllRoutes from './register-routes';
import registerApplicationMiddlewares from './register-middlewares';
import createKoaApp from './koa';
import requestCtx from '../request-context';

const healthCheck: Core.MiddlewareHandler = async (ctx) => {
  ctx.set('metrix', 'You are so French!');
  ctx.status = 204;
};

const createServer = (metrix: Core.Strapi): Modules.Server.Server => {
  const app = createKoaApp({
    proxy: metrix.config.get('server.proxy.koa'),
    keys: metrix.config.get('server.app.keys'),
  });

  app.use((ctx, next) => requestCtx.run(ctx, () => next()));

  const router = new Router();

  const routeManager = createRouteManager(metrix);

  const httpServer = createHTTPServer(metrix, app);

  const apis = {
    'content-api': createContentAPI(metrix),
    admin: createAdminAPI(metrix),
  };

  // init health check
  router.all('/_health', healthCheck);

  const state = {
    mounted: false,
  };

  return {
    app,
    router,
    httpServer,

    api(name) {
      return apis[name];
    },

    use(...args) {
      app.use(...args);
      return this;
    },

    routes(routes: Core.Router | Omit<Core.Route, 'info'>[]) {
      if (!Array.isArray(routes) && routes.type) {
        const api = apis[routes.type];
        if (!api) {
          throw new Error(`API ${routes.type} not found. Possible APIs are ${Object.keys(apis)}`);
        }

        apis[routes.type].routes(routes);
        return this;
      }

      routeManager.addRoutes(routes, router);
      return this;
    },

    mount() {
      state.mounted = true;

      Object.values(apis).forEach((api) => api.mount(router));
      app.use(router.routes()).use(router.allowedMethods());

      return this;
    },

    initRouting() {
      registerAllRoutes(metrix);

      return this;
    },

    async initMiddlewares() {
      await registerApplicationMiddlewares(metrix);

      return this;
    },

    listRoutes() {
      return [...router.stack];
    },

    listen(...args: any[]) {
      if (!state.mounted) {
        this.mount();
      }

      return httpServer.listen(...args);
    },

    async destroy() {
      await httpServer.destroy();
    },
  };
};

export { createServer };
