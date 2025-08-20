import type { DocumentContext } from '../../types';

import { createDebugger } from '../../utils';

import type { Assembler } from '..';

const debug = createDebugger('assembler:metadata');

export class DocumentMetadataAssembler implements Assembler.Document {
  assemble(context: DocumentContext): void {
    const { metrix } = context;

    const strapiVersion = metrix.config.get<string>('info.metrix');

    debug(`assembling document's metadata for %O...`, { strapiVersion });

    const metadata = new Map<string, unknown>()
      .set('openapi', '3.1.0')
      .set('x-powered-by', 'metrix')
      .set('x-metrix-version', strapiVersion);

    const metadataObject = Object.fromEntries(metadata);

    debug(`document's metadata assembled: %O`, metadataObject);

    Object.assign(context.output.data, metadataObject);
  }
}
