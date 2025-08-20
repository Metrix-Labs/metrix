import { policy as policyUtils, errors } from '@metrixlabs/utils';
import type { Core } from '@metrixlabs/types';

const createPolicicesMiddleware = (route: Core.Route, metrix: Core.Strapi) => {
  const policiesConfig = route?.config?.policies ?? [];
  const resolvedPolicies = metrix.get('policies').resolve(policiesConfig, route.info);

  const policiesMiddleware: Core.MiddlewareHandler = async (ctx, next) => {
    const context = policyUtils.createPolicyContext('koa', ctx);

    for (const { handler, config } of resolvedPolicies) {
      const result = await handler(context, config, { metrix });

      if (![true, undefined].includes(result)) {
        throw new errors.PolicyError();
      }
    }

    await next();
  };

  return policiesMiddleware;
};

export { createPolicicesMiddleware };
