import { Readable } from 'stream';
import { chain } from 'stream-chain';
import type { Core, Struct } from '@metrixlabs/types';

import type { IMetadata, ISourceProvider, ProviderType } from '../../../../types';
import type { IDiagnosticReporter } from '../../../utils/diagnostic';
import { createEntitiesStream, createEntitiesTransformStream } from './entities';
import { createLinksStream } from './links';
import { createConfigurationStream } from './configuration';
import { createAssetsStream } from './assets';
import * as utils from '../../../utils';
import { assertValidStrapi } from '../../../utils/providers';

export interface ILocalStrapiSourceProviderOptions {
  getStrapi(): Core.Strapi | Promise<Core.Strapi>; // return an initialized instance of Strapi

  autoDestroy?: boolean; // shut down the instance returned by getStrapi() at the end of the transfer
}

export const createLocalStrapiSourceProvider = (options: ILocalStrapiSourceProviderOptions) => {
  return new LocalStrapiSourceProvider(options);
};

class LocalStrapiSourceProvider implements ISourceProvider {
  name = 'source::local-metrix';

  type: ProviderType = 'source';

  options: ILocalStrapiSourceProviderOptions;

  metrix?: Core.Strapi;

  #diagnostics?: IDiagnosticReporter;

  constructor(options: ILocalStrapiSourceProviderOptions) {
    this.options = options;
  }

  async bootstrap(diagnostics?: IDiagnosticReporter): Promise<void> {
    this.#diagnostics = diagnostics;
    this.metrix = await this.options.getStrapi();
    this.metrix.db.lifecycles.disable();
  }

  #reportInfo(message: string) {
    this.#diagnostics?.report({
      details: {
        createdAt: new Date(),
        message,
        origin: 'local-source-provider',
      },
      kind: 'info',
    });
  }

  /**
   * Reports an error to the diagnostic reporter.
   */
  #reportError(message: string, error: Error) {
    this.#diagnostics?.report({
      details: {
        createdAt: new Date(),
        message,
        error,
        severity: 'fatal',
        name: error.name,
      },
      kind: 'error',
    });
  }

  /**
   * Handles errors that occur in read streams.
   */
  #handleStreamError(streamType: string, err: Error) {
    const { message, stack } = err;
    const errorMessage = `[Data transfer] Error in ${streamType} read stream: ${message}`;
    const formattedError = {
      message: errorMessage,
      stack,
      timestamp: new Date().toISOString(),
    };

    this.metrix?.log.error(formattedError);
    this.#reportError(formattedError.message, err);
  }

  async close(): Promise<void> {
    const { autoDestroy } = this.options;
    assertValidStrapi(this.metrix);
    this.metrix.db.lifecycles.enable();
    // Basically `!== false` but more deterministic
    if (autoDestroy === undefined || autoDestroy === true) {
      await this.metrix?.destroy();
    }
  }

  getMetadata(): IMetadata {
    this.#reportInfo('getting metadata');
    const strapiVersion = metrix.config.get<string>('info.metrix');
    const createdAt = new Date().toISOString();

    return {
      createdAt,
      metrix: {
        version: strapiVersion,
      },
    };
  }

  async createEntitiesReadStream(): Promise<Readable> {
    assertValidStrapi(this.metrix, 'Not able to stream entities');
    this.#reportInfo('creating entities read stream');
    return chain([
      // Entities stream
      createEntitiesStream(this.metrix),

      // Transform stream
      createEntitiesTransformStream(),
    ]);
  }

  createLinksReadStream(): Readable {
    assertValidStrapi(this.metrix, 'Not able to stream links');
    this.#reportInfo('creating links read stream');

    return createLinksStream(this.metrix);
  }

  createConfigurationReadStream(): Readable {
    assertValidStrapi(this.metrix, 'Not able to stream configuration');
    this.#reportInfo('creating configuration read stream');
    return createConfigurationStream(this.metrix);
  }

  getSchemas(): Record<string, Struct.Schema> {
    assertValidStrapi(this.metrix, 'Not able to get Schemas');
    this.#reportInfo('getting schemas');
    const schemas = utils.schema.schemasToValidJSON({
      ...this.metrix.contentTypes,
      ...this.metrix.components,
    });

    return utils.schema.mapSchemasValues(schemas);
  }

  createSchemasReadStream(): Readable {
    return Readable.from(Object.values(this.getSchemas()));
  }

  createAssetsReadStream(): Readable {
    assertValidStrapi(this.metrix, 'Not able to stream assets');
    this.#reportInfo('creating assets read stream');

    const stream = createAssetsStream(this.metrix);
    stream.on('error', (err) => {
      this.#handleStreamError('assets', err);
    });

    return stream;
  }
}

export type ILocalStrapiSourceProvider = InstanceType<typeof LocalStrapiSourceProvider>;
