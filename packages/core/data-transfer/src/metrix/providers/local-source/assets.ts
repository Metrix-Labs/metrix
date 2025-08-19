import { join } from 'path';
import { Duplex, PassThrough, Readable } from 'stream';
import { stat, createReadStream, ReadStream } from 'fs-extra';
import * as webStream from 'stream/web';
import type { Core } from '@metrix/types';

import type { IAsset, IFile } from '../../../../types';

function getFileStream(
  filepath: string,
  metrix: Core.Strapi,
  isLocal = false
): PassThrough | ReadStream {
  if (isLocal) {
    // Todo: handle errors
    return createReadStream(filepath);
  }

  const readableStream = new PassThrough();

  // fetch the image from remote url and stream it
  metrix
    .fetch(filepath)
    .then((res: Response) => {
      if (res.status !== 200) {
        readableStream.emit('error', new Error(`Request failed with status code ${res.status}`));
        return;
      }

      if (res.body) {
        // pipe the image data
        Readable.fromWeb(res.body as webStream.ReadableStream<Uint8Array>).pipe(readableStream);
      } else {
        readableStream.emit('error', new Error('Empty data found for file'));
      }
    })
    .catch((error: unknown) => {
      readableStream.emit('error', error);
    });

  return readableStream;
}

function getFileStats(
  filepath: string,
  metrix: Core.Strapi,
  isLocal = false
): Promise<{ size: number }> {
  if (isLocal) {
    return stat(filepath);
  }
  return new Promise((resolve, reject) => {
    metrix
      .fetch(filepath)
      .then((res: Response) => {
        if (res.status !== 200) {
          reject(new Error(`Request failed with status code ${res.status}`));
          return;
        }

        const contentLength = res.headers.get('content-length');
        const stats = {
          size: contentLength ? parseInt(contentLength, 10) : 0,
        };

        resolve(stats);
      })
      .catch((error: unknown) => {
        reject(error);
      });
  });
}

async function signFile(file: IFile) {
  const { provider } = metrix.plugins.upload;
  const { provider: providerName } = metrix.config.get('plugin.upload') as { provider: string };
  const isPrivate = await provider.isPrivate();
  if (file?.provider === providerName && isPrivate) {
    const signUrl = async (file: IFile) => {
      const signedUrl = await provider.getSignedUrl(file);
      file.url = signedUrl.url;
    };

    // Sign the original file
    await signUrl(file);
    // Sign each file format
    if (file.formats) {
      for (const format of Object.keys(file.formats)) {
        await signUrl(file.formats[format]);
      }
    }
  }
}

/**
 * Generate and consume assets streams in order to stream each file individually
 */
export const createAssetsStream = (metrix: Core.Strapi): Duplex => {
  const generator: () => AsyncGenerator<IAsset, void> = async function* () {
    const stream: Readable = metrix.db
      .queryBuilder('plugin::upload.file')
      // Create a query builder instance (default type is 'select')
      // Fetch all columns
      .select('*')
      // Get a readable stream
      .stream();

    for await (const file of stream) {
      const isLocalProvider = file.provider === 'local';
      if (!isLocalProvider) {
        await signFile(file);
      }
      const filepath = isLocalProvider ? join(metrix.dirs.static.public, file.url) : file.url;
      const stats = await getFileStats(filepath, metrix, isLocalProvider);
      const stream = getFileStream(filepath, metrix, isLocalProvider);

      yield {
        metadata: file,
        filepath,
        filename: file.hash + file.ext,
        stream,
        stats: { size: stats.size },
      };

      if (file.formats) {
        for (const format of Object.keys(file.formats)) {
          const fileFormat = file.formats[format];
          const fileFormatFilepath = isLocalProvider
            ? join(metrix.dirs.static.public, fileFormat.url)
            : fileFormat.url;
          const fileFormatStats = await getFileStats(fileFormatFilepath, metrix, isLocalProvider);
          const fileFormatStream = getFileStream(fileFormatFilepath, metrix, isLocalProvider);
          const metadata = { ...fileFormat, type: format, id: file.id, mainHash: file.hash };
          yield {
            metadata,
            filepath: fileFormatFilepath,
            filename: fileFormat.hash + fileFormat.ext,
            stream: fileFormatStream,
            stats: { size: fileFormatStats.size },
          };
        }
      }
    }
  };

  return Duplex.from(generator());
};
