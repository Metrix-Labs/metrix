import type { Core } from '@metrixlabs/types';

export const logger: Core.MiddlewareFactory = (_, { metrix }) => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);

    metrix.log.http(`${ctx.method} ${ctx.url} (${delta} ms) ${ctx.status}`);
  };
};
