import { has } from 'lodash/fp';
import type { Core } from '@metrixlabs/types';

const apisRegistry = (metrix: Core.Strapi) => {
  const apis: Record<string, unknown> = {};

  return {
    get(name: string) {
      return apis[name];
    },
    getAll() {
      return apis;
    },
    add(apiName: string, apiConfig: unknown) {
      if (has(apiName, apis)) {
        throw new Error(`API ${apiName} has already been registered.`);
      }

      const api = metrix.get('modules').add(`api::${apiName}`, apiConfig);

      apis[apiName] = api;

      return apis[apiName];
    },
  };
};

export default apisRegistry;
