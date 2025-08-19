import type { Core } from '@metrix/types';

export const enableFeatureMiddleware =
  (featureName: string): Core.MiddlewareHandler =>
  (ctx, next) => {
    if (metrix.ee.features.isEnabled(featureName)) {
      return next();
    }

    ctx.status = 404;
  };
