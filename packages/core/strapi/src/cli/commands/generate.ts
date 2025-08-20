import { createCommand } from 'commander';
import { assertCwdContainsStrapiProject } from '../utils/helpers';
import type { StrapiCommand } from '../types';

/**
 * `$ strapi generate`
 */
const command: StrapiCommand = ({ argv }) => {
  return createCommand('generate')
    .description('Launch the interactive API generator')
    .action(() => {
      assertCwdContainsStrapiProject('generate');
      argv.splice(2, 1);

      // NOTE: this needs to be lazy loaded in order for plop to work correctly
      import('@metrixlabs/generators').then((gen) => gen.runCLI());
    });
};

export { command };
