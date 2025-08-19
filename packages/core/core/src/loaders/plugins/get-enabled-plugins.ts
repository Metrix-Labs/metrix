/* eslint-disable @typescript-eslint/no-var-requires */
import { dirname, join, resolve } from 'path';
import { statSync, existsSync } from 'fs';
import _ from 'lodash';
import { get, pickBy, defaultsDeep, map, prop, pipe } from 'lodash/fp';
import { strings } from '@metrixlabs/utils';
import type { Core } from '@metrixlabs/types';
import { getUserPluginsConfig } from './get-user-plugins-config';

interface PluginMeta {
  enabled: boolean;
  pathToPlugin?: string;
  info: Record<string, unknown>;
  packageInfo?: Record<string, unknown>;
}

type PluginMetas = Record<string, PluginMeta>;

interface PluginInfo {
  name: string;
  kind: string;
}

interface PluginDeclaration {
  enabled: boolean;
  resolve: string;
  isModule: boolean;
}

/**
 * otherwise known as "core features"
 *
 * NOTE: These are excluded from the content manager plugin list, as they are always enabled.
 *       See admin.ts server controller on the content-manager plugin for more details.
 */
const INTERNAL_PLUGINS = [
  '@metrixlabs/content-manager',
  '@metrixlabs/content-type-builder',
  '@metrixlabs/email',
  '@metrixlabs/upload',
  '@metrixlabs/i18n',
  '@metrixlabs/content-releases',
  '@metrixlabs/review-workflows',
];

const isStrapiPlugin = (info: PluginInfo) => get('metrix.kind', info) === 'plugin';

const validatePluginName = (pluginName: string) => {
  if (!strings.isKebabCase(pluginName)) {
    throw new Error(`Plugin name "${pluginName}" is not in kebab (an-example-of-kebab-case)`);
  }
};

const toDetailedDeclaration = (declaration: boolean | PluginDeclaration) => {
  if (typeof declaration === 'boolean') {
    return { enabled: declaration };
  }

  const detailedDeclaration: { enabled: boolean; pathToPlugin?: string } = {
    enabled: declaration.enabled,
  };

  if (declaration?.resolve) {
    let pathToPlugin = '';

    if (declaration.isModule) {
      /**
       * we only want the node_module here, not the package.json
       */
      pathToPlugin = join(declaration.resolve, '..');
    } else {
      try {
        pathToPlugin = dirname(require.resolve(declaration.resolve));
      } catch (e) {
        pathToPlugin = resolve(metrix.dirs.app.root, declaration.resolve);

        if (!existsSync(pathToPlugin) || !statSync(pathToPlugin).isDirectory()) {
          throw new Error(`${declaration.resolve} couldn't be resolved`);
        }
      }
    }

    detailedDeclaration.pathToPlugin = pathToPlugin;
  }

  return detailedDeclaration;
};

export const getEnabledPlugins = async (metrix: Core.Strapi, { client } = { client: false }) => {
  const internalPlugins: PluginMetas = {};

  for (const dep of INTERNAL_PLUGINS) {
    const packagePath = join(dep, 'package.json');

    // NOTE: internal plugins should be resolved from the metrix package
    const packageModulePath = require.resolve(packagePath, {
      paths: [require.resolve('@metrixlabs/metrix/package.json'), process.cwd()],
    });

    const packageInfo = require(packageModulePath);

    const pluginName = (packageInfo as any).metrix?.name ?? (packageInfo as any).strapi?.name ?? packageInfo.name;
    validatePluginName(pluginName);
    internalPlugins[pluginName] = {
      ...toDetailedDeclaration({ enabled: true, resolve: packageModulePath, isModule: client }),
      info: packageInfo.metrix,
      packageInfo,
    };
  }

  const installedPlugins: PluginMetas = {};
  const dependencies = metrix.config.get('info.dependencies', {});

  for (const dep of Object.keys(dependencies)) {
    const packagePath = join(dep, 'package.json');
    let packageInfo;
    try {
      packageInfo = require(packagePath);
    } catch {
      continue;
    }

    if (isStrapiPlugin(packageInfo)) {
      const name = (packageInfo as any).metrix?.name ?? (packageInfo as any).strapi?.name ?? packageInfo.name;
      validatePluginName(name);
      installedPlugins[name] = {
        ...toDetailedDeclaration({ enabled: true, resolve: packagePath, isModule: client }),
        info: {
          ...packageInfo.metrix,
          packageName: packageInfo.name,
        },
        packageInfo,
      };
    }
  }

  const declaredPlugins: PluginMetas = {};
  const userPluginsConfig = await getUserPluginsConfig();

  _.forEach(userPluginsConfig, (declaration, pluginName) => {
    validatePluginName(pluginName);

    declaredPlugins[pluginName] = {
      ...toDetailedDeclaration(declaration),
      info: {},
    };

    const { pathToPlugin } = declaredPlugins[pluginName];

    // for manually resolved plugins
    if (pathToPlugin) {
      const packagePath = join(pathToPlugin, 'package.json');
      const packageInfo = require(packagePath);

      if (isStrapiPlugin(packageInfo)) {
        declaredPlugins[pluginName].info = packageInfo.metrix || {};
        declaredPlugins[pluginName].packageInfo = packageInfo;
      }
    }
  });

  const declaredPluginsResolves = map(prop('pathToPlugin'), declaredPlugins);
  const installedPluginsNotAlreadyUsed = pickBy(
    (p) => !declaredPluginsResolves.includes(p.pathToPlugin),
    installedPlugins
  );

  const enabledPlugins = pipe(
    defaultsDeep(declaredPlugins),
    defaultsDeep(installedPluginsNotAlreadyUsed),
    pickBy((p: PluginMeta) => p.enabled)
  )(internalPlugins);

  return enabledPlugins;
};
