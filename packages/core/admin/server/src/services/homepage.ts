import { Core } from '@metrixlabs/types';
import { getService } from '../utils';

const isContentTypeVisible = (model: any) =>
  model?.pluginOptions?.['content-type-builder']?.visible !== false;

export const homepageService = ({ metrix }: { metrix: Core.Strapi }) => {
  const getKeyStatistics = async () => {
    const contentTypes = Object.entries(metrix.contentTypes).filter(([, contentType]) => {
      return isContentTypeVisible(contentType);
    });

    const countApiTokens = await getService('api-token').count();
    const countAdmins = await getService('user').count();
    const countLocales = (await metrix.plugin('i18n')?.service('locales')?.count()) ?? null;
    const countsAssets = await metrix.db.query('plugin::upload.file').count();
    const countWebhooks = await metrix.db.query('metrix::webhook').count();

    const componentCategories = new Set(
      Object.values(metrix.components).map((component) => component.category)
    );
    const components = Array.from(componentCategories);

    return {
      assets: countsAssets,
      contentTypes: contentTypes.length,
      components: components.length,
      locales: countLocales,
      admins: countAdmins,
      webhooks: countWebhooks,
      apiTokens: countApiTokens,
    };
  };

  return {
    getKeyStatistics,
  };
};
