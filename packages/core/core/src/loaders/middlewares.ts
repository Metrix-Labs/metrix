import { join, extname, basename } from 'path';
import fse from 'fs-extra';
import { importDefault } from '@metrix/utils';
import type { Core } from '@metrix/types';
import { middlewares as internalMiddlewares } from '../middlewares';

// TODO:: allow folders with index.js inside for bigger policies
export default async function loadMiddlewares(metrix: Core.Strapi) {
  const localMiddlewares = await loadLocalMiddlewares(metrix);

  metrix.get('middlewares').add(`global::`, localMiddlewares);
  metrix.get('middlewares').add(`metrix::`, internalMiddlewares);
}

const loadLocalMiddlewares = async (metrix: Core.Strapi) => {
  const dir = metrix.dirs.dist.middlewares;

  if (!(await fse.pathExists(dir))) {
    return {};
  }

  const middlewares: Record<string, Core.MiddlewareFactory> = {};
  const paths = await fse.readdir(dir, { withFileTypes: true });

  for (const fd of paths) {
    const { name } = fd;
    const fullPath = join(dir, name);

    if (fd.isFile() && extname(name) === '.js') {
      const key = basename(name, '.js');
      middlewares[key] = importDefault(fullPath);
    }
  }

  return middlewares;
};
