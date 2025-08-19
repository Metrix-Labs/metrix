import _ from 'lodash';
import { sanitize, validate } from '@metrix/utils';

import type { Core, UID } from '@metrix/types';

import instantiatePermissionsUtilities from './permissions';

const transformRoutePrefixFor = (pluginName: string) => (route: Core.Route) => {
  const prefix = route.config && route.config.prefix;
  const path = prefix !== undefined ? `${prefix}${route.path}` : `/${pluginName}${route.path}`;

  return {
    ...route,
    path,
  };
};

const filterContentAPI = (route: Core.Route) => route.info.type === 'content-api';

/**
 * Create a content API container that holds logic, tools and utils. (eg: permissions, ...)
 */
const createContentAPI = (metrix: Core.Strapi) => {
  const getRoutesMap = async () => {
    const routesMap: Record<string, Core.Route[]> = {};

    _.forEach(metrix.apis, (api, apiName) => {
      const routes = _.flatMap(api.routes, (route) => {
        if ('routes' in route) {
          return route.routes;
        }

        return route;
      }).filter(filterContentAPI);

      if (routes.length === 0) {
        return;
      }

      const apiPrefix = metrix.config.get('api.rest.prefix');
      routesMap[`api::${apiName}`] = routes.map((route) => ({
        ...route,
        path: `${apiPrefix}${route.path}`,
      }));
    });

    _.forEach(metrix.plugins, (plugin, pluginName) => {
      const transformPrefix = transformRoutePrefixFor(pluginName);

      if (Array.isArray(plugin.routes)) {
        return plugin.routes.map(transformPrefix).filter(filterContentAPI);
      }

      const routes = _.flatMap(plugin.routes, (route) => route.routes.map(transformPrefix)).filter(
        filterContentAPI
      );

      if (routes.length === 0) {
        return;
      }

      const apiPrefix = metrix.config.get('api.rest.prefix');
      routesMap[`plugin::${pluginName}`] = routes.map((route) => ({
        ...route,
        path: `${apiPrefix}${route.path}`,
      }));
    });

    return routesMap;
  };

  const sanitizer = sanitize.createAPISanitizers({
    getModel(uid: string) {
      return metrix.getModel(uid as UID.Schema);
    },
    // NOTE: use lazy access to allow registration of sanitizers after the creation of the container
    get sanitizers() {
      return {
        input: metrix.sanitizers.get('content-api.input'),
        output: metrix.sanitizers.get('content-api.output'),
      };
    },
  });

  const validator = validate.createAPIValidators({
    getModel(uid: string) {
      return metrix.getModel(uid as UID.Schema);
    },
    // NOTE: use lazy access to allow registration of validators after the creation of the container
    get validators() {
      return {
        input: metrix.validators.get('content-api.input'),
      };
    },
  });

  return {
    permissions: instantiatePermissionsUtilities(metrix),
    getRoutesMap,
    sanitize: sanitizer,
    validate: validator,
  };
};

export default createContentAPI;
