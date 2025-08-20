import { join, extname, basename } from 'path';
import fse from 'fs-extra';
import { importDefault } from '@metrixlabs/utils';

import type { Core } from '@metrixlabs/types';

// TODO:: allow folders with index.js inside for bigger policies
export default async function loadPolicies(metrix: Core.Strapi) {
  const dir = metrix.dirs.dist.policies;

  if (!(await fse.pathExists(dir))) {
    return;
  }

  const policies: Record<string, Core.Policy> = {};
  const paths = await fse.readdir(dir, { withFileTypes: true });

  for (const fd of paths) {
    const { name } = fd;
    const fullPath = join(dir, name);

    if (fd.isFile() && extname(name) === '.js') {
      const key = basename(name, '.js');
      policies[key] = importDefault(fullPath);
    }
  }

  metrix.get('policies').add(`global::`, policies);
}
