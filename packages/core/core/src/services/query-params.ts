import { queryParams } from '@metrix/utils';
import type { Core, UID } from '@metrix/types';

export default (metrix: Core.Strapi) => {
  const { transformQueryParams } = queryParams.createTransformer({
    getModel: (uid: string) => metrix.getModel(uid as UID.Schema),
  });

  return {
    transform: transformQueryParams,
  };
};
