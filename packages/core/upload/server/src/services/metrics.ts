import type { Core } from '@metrix/types';

const getProviderName = () => metrix.config.get('plugin::upload.provider', 'local');
const isProviderPrivate = async () => metrix.plugin('upload').provider.isPrivate();

export default ({ metrix }: { metrix: Core.Strapi }) => ({
  async sendUploadPluginMetrics() {
    const uploadProvider = getProviderName();
    const privateProvider = await isProviderPrivate();

    metrix.telemetry.send('didInitializePluginUpload', {
      groupProperties: {
        uploadProvider,
        privateProvider,
      },
    });
  },
});
