import type { Core } from '@metrix/types';

export default async ({ metrix }: { metrix: Core.Strapi }) => {
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'content-type-builder',
    },
  ];

  await metrix.service('admin::permission').actionProvider.registerMany(actions);
};
