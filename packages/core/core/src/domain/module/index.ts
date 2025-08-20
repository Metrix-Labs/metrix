import _, { type PropertyPath, flatten } from 'lodash';
import { yup } from '@metrixlabs/utils';
import type { Core, UID, Struct } from '@metrixlabs/types';

import { removeNamespace } from '../../registries/namespace';
import { validateModule } from './validation';

interface LifecyclesState {
  bootstrap?: boolean;
  register?: boolean;
  destroy?: boolean;
}

export interface RawModule {
  config?: Record<string, unknown>;
  routes?: Core.Module['routes'];
  controllers?: Core.Module['controllers'];
  services?: Core.Module['services'];
  contentTypes?: Core.Module['contentTypes'];
  policies?: Core.Module['policies'];
  middlewares?: Core.Module['middlewares'];
  bootstrap?: (params: { metrix: Core.Strapi }) => Promise<void>;
  register?: (params: { metrix: Core.Strapi }) => Promise<void>;
  destroy?: (params: { metrix: Core.Strapi }) => Promise<void>;
}

export interface Module {
  bootstrap: () => Promise<void>;
  register: () => Promise<void>;
  destroy: () => Promise<void>;
  load: () => void;
  routes: Core.Module['routes'];
  config<T = unknown>(key: PropertyPath, defaultVal?: T): T; // TODO: this mirrors ConfigProvider.get, we should use it directly
  contentType: (ctName: UID.ContentType) => Struct.ContentTypeSchema;
  contentTypes: Record<string, Struct.ContentTypeSchema>;
  service: (serviceName: UID.Service) => Core.Service;
  services: Record<string, Core.Service>;
  policy: (policyName: UID.Policy) => Core.Policy;
  policies: Record<string, Core.Policy>;
  middleware: (middlewareName: UID.Middleware) => Core.Middleware;
  middlewares: Record<string, Core.Middleware>;
  controller: (controllerName: UID.Controller) => Core.Controller;
  controllers: Record<string, Core.Controller>;
}

// Removes the namespace from a map with keys prefixed with a namespace
const removeNamespacedKeys = <T extends Record<string, unknown>>(map: T, namespace: string) => {
  return _.mapKeys(map, (value, key) => removeNamespace(key, namespace));
};

const defaultModule = {
  config: {},
  routes: [],
  controllers: {},
  services: {},
  contentTypes: {},
  policies: {},
  middlewares: {},
};

export const createModule = (
  namespace: string,
  rawModule: RawModule,
  metrix: Core.Strapi
): Module => {
  _.defaults(rawModule, defaultModule);

  try {
    validateModule(rawModule);
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      throw new Error(`metrix-server.js is invalid for '${namespace}'.\n${e.errors.join('\n')}`);
    }
  }

  const called: LifecyclesState = {};
  return {
    async bootstrap() {
      if (called.bootstrap) {
        throw new Error(`Bootstrap for ${namespace} has already been called`);
      }
      called.bootstrap = true;
      await (rawModule.bootstrap && rawModule.bootstrap({ metrix }));
    },
    async register() {
      if (called.register) {
        throw new Error(`Register for ${namespace} has already been called`);
      }
      called.register = true;
      await (rawModule.register && rawModule.register({ metrix }));
    },
    async destroy() {
      if (called.destroy) {
        throw new Error(`Destroy for ${namespace} has already been called`);
      }
      called.destroy = true;
      await (rawModule.destroy && rawModule.destroy({ metrix }));
    },
    load() {
      metrix.get('content-types').add(namespace, rawModule.contentTypes);
      metrix.get('services').add(namespace, rawModule.services);
      metrix.get('policies').add(namespace, rawModule.policies);
      metrix.get('middlewares').add(namespace, rawModule.middlewares);
      metrix.get('controllers').add(namespace, rawModule.controllers);
      metrix.get('config').set(namespace, rawModule.config);
    },
    get routes() {
      return rawModule.routes ?? {};
    },
    set routes(routes: Record<string, Core.Router>) {
      rawModule.routes = routes;
    },
    config(path: PropertyPath, defaultValue: unknown) {
      const pathArray = flatten([namespace, path]);
      return metrix.get('config').get(pathArray, defaultValue);
    },
    contentType(ctName: UID.ContentType) {
      return metrix.get('content-types').get(`${namespace}.${ctName}`);
    },
    get contentTypes() {
      const contentTypes = metrix.get('content-types').getAll(namespace);
      return removeNamespacedKeys(contentTypes, namespace);
    },
    service(serviceName: UID.Service) {
      return metrix.get('services').get(`${namespace}.${serviceName}`);
    },
    get services() {
      const services = metrix.get('services').getAll(namespace);
      return removeNamespacedKeys(services, namespace);
    },
    policy(policyName: UID.Policy) {
      return metrix.get('policies').get(`${namespace}.${policyName}`);
    },
    get policies() {
      const policies = metrix.get('policies').getAll(namespace);
      return removeNamespacedKeys(policies, namespace);
    },
    middleware(middlewareName: UID.Middleware) {
      return metrix.get('middlewares').get(`${namespace}.${middlewareName}`);
    },
    get middlewares() {
      const middlewares = metrix.get('middlewares').getAll(namespace);
      return removeNamespacedKeys(middlewares, namespace);
    },
    controller(controllerName: UID.Controller) {
      return metrix.get('controllers').get(`${namespace}.${controllerName}`);
    },
    get controllers() {
      const controllers = metrix.get('controllers').getAll(namespace);
      return removeNamespacedKeys(controllers, namespace);
    },
  };
};
