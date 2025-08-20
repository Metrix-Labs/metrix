export const enableFeatureMiddleware = (featureName: string) => (ctx: any, next: any) => {
  if (metrix.ee.features.isEnabled(featureName)) {
    return next();
  }

  ctx.status = 404;
};
