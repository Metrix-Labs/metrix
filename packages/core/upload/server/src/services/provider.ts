import { isFunction } from 'lodash/fp';
import { file as fileUtils } from '@metrixlabs/utils';
import type { Core } from '@metrixlabs/types';

import { Config, UploadableFile } from '../types';

export default ({ metrix }: { metrix: Core.Strapi }) => ({
  async checkFileSize(file: UploadableFile) {
    const { sizeLimit } = metrix.config.get<Config>('plugin::upload');
    await metrix.plugin('upload').provider.checkFileSize(file, { sizeLimit });
  },

  async upload(file: UploadableFile) {
    if (isFunction(metrix.plugin('upload').provider.uploadStream)) {
      file.stream = file.getStream();
      await metrix.plugin('upload').provider.uploadStream(file);

      delete file.stream;

      if ('filepath' in file) {
        delete file.filepath;
      }
    } else {
      file.buffer = await fileUtils.streamToBuffer(file.getStream());
      await metrix.plugin('upload').provider.upload(file);

      delete file.buffer;

      if ('filepath' in file) {
        delete file.filepath;
      }
    }
  },
});
