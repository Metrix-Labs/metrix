import type { Internal, Schema } from '@metrixlabs/types';

import type { Context } from '../../types';

export default ({ metrix }: Context) => ({
  buildComponentResolver({
    contentTypeUID,
    attributeName,
  }: {
    contentTypeUID: Internal.UID.ContentType;
    attributeName: string;
  }) {
    const { transformArgs } = metrix.plugin('graphql').service('builders').utils;

    return async (parent: any, args: any, ctx: any) => {
      const contentType = metrix.getModel(contentTypeUID);

      const { component: componentName } = contentType.attributes[
        attributeName
      ] as Schema.Attribute.Component;

      const component = metrix.getModel(componentName);

      const transformedArgs = transformArgs(args, { contentType: component, usePagination: true });
      await metrix.contentAPI.validate.query(transformedArgs, component, {
        auth: ctx?.state?.auth,
      });

      const sanitizedQuery = await metrix.contentAPI.sanitize.query(transformedArgs, component, {
        auth: ctx?.state?.auth,
      });

      const dbQuery = metrix.get('query-params').transform(component.uid, sanitizedQuery);

      return metrix.db?.query(contentTypeUID).load(parent, attributeName, dbQuery);
    };
  },
});
