import type { Context } from 'koa';
import type { GetRoutes, GetPermissions } from '../../../shared/contracts/content-api';
import '@metrixlabs/types';

export default {
  async getPermissions(ctx: Context) {
    const actionsMap = await metrix.contentAPI.permissions.getActionsMap();

    ctx.send({ data: actionsMap } satisfies GetPermissions.Response);
  },

  async getRoutes(ctx: Context) {
    const routesMap = await metrix.contentAPI.getRoutesMap();

    ctx.send({ data: routesMap } satisfies GetRoutes.Response);
  },
};
