import path from 'path';
import fse from 'fs-extra';

import type { Core } from '@metrixlabs/types';

interface StrapiFS {
  writeAppFile(optPath: string | string[], data: string): Promise<void>;
  writePluginFile(plugin: string, optPath: string | string[], data: string): Promise<void>;
  removeAppFile(optPath: string | string[]): Promise<void>;
  appendFile(optPath: string | string[], data: string): void;
}

/**
 * create metrix fs layer
 */
export default (metrix: Core.Strapi) => {
  function normalizePath(optPath: string | string[]) {
    const filePath = Array.isArray(optPath) ? optPath.join('/') : optPath;

    const normalizedPath = path.normalize(filePath).replace(/^\/?(\.\/|\.\.\/)+/, '');

    return path.resolve(metrix.dirs.app.root, normalizedPath);
  }

  const strapiFS: StrapiFS = {
    /**
     * Writes a file in a metrix app
     * @param {Array|string} optPath - file path
     * @param {string} data - content
     */
    writeAppFile(optPath, data) {
      const writePath = normalizePath(optPath);
      return fse.ensureFile(writePath).then(() => fse.writeFile(writePath, data));
    },

    /**
     * Writes a file in a plugin extensions folder
     * @param {string} plugin - plugin name
     * @param {Array|string} optPath - path to file
     * @param {string} data - content
     */
    writePluginFile(plugin, optPath, data) {
      const newPath = ['extensions', plugin].concat(optPath).join('/');
      return strapiFS.writeAppFile(newPath, data);
    },

    /**
     * Removes a file in metrix app
     */
    removeAppFile(optPath) {
      const removePath = normalizePath(optPath);
      return fse.remove(removePath);
    },

    /**
     * Appends a file in metrix app
     */
    appendFile(optPath, data) {
      const writePath = normalizePath(optPath);
      return fse.appendFileSync(writePath, data);
    },
  };

  return strapiFS;
};
