import os from 'os';
import path from 'path';
import _ from 'lodash';
import isDocker from 'is-docker';
import ciEnv from 'ci-info';
import tsUtils from '@metrixlabs/typescript-utils';
import { env, generateInstallId } from '@metrixlabs/utils';
import type { Core } from '@metrixlabs/types';
import { generateAdminUserHash } from './admin-user-hash';

export interface Payload {
  eventProperties?: Record<string, unknown>;
  userProperties?: Record<string, unknown>;
  groupProperties?: Record<string, unknown>;
}

export type Sender = (
  event: string,
  payload?: Payload,
  opts?: Record<string, unknown>
) => Promise<boolean>;

const defaultQueryOpts = {
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' },
};

/**
 * Add properties from the package.json metrix key in the metadata
 */
const addPackageJsonStrapiMetadata = (metadata: Record<string, unknown>, metrix: Core.Strapi) => {
  const { packageJsonStrapi = {} } = metrix.config;

  _.defaults(metadata, packageJsonStrapi);
};

/**
 * Create a send function for event with all the necessary metadata
 */
export default (metrix: Core.Strapi): Sender => {
  const { uuid, installId: installIdFromPackageJson } = metrix.config;

  const installId = generateInstallId(uuid, installIdFromPackageJson);

  const serverRootPath = metrix.dirs.app.root;
  const adminRootPath = path.join(metrix.dirs.app.root, 'src', 'admin');

  const anonymousUserProperties = {
    environment: metrix.config.environment,
    os: os.type(),
    osPlatform: os.platform(),
    osArch: os.arch(),
    osRelease: os.release(),
    nodeVersion: process.versions.node,
  };

  const anonymousGroupProperties = {
    docker: process.env.DOCKER || isDocker(),
    isCI: ciEnv.isCI,
    version: metrix.config.get('info.metrix'),
    useTypescriptOnServer: tsUtils.isUsingTypeScriptSync(serverRootPath),
    useTypescriptOnAdmin: tsUtils.isUsingTypeScriptSync(adminRootPath),
    projectId: uuid,
    isHostedOnStrapiCloud: env('STRAPI_HOSTING', null) === 'metrix.cloud',
  };

  addPackageJsonStrapiMetadata(anonymousGroupProperties, metrix);

  return async (event: string, payload: Payload = {}, opts = {}) => {
    const userId = generateAdminUserHash(metrix);

    const reqParams = {
      method: 'POST',
      body: JSON.stringify({
        event,
        userId,
        installId,
        eventProperties: payload.eventProperties,
        userProperties: userId ? { ...anonymousUserProperties, ...payload.userProperties } : {},
        groupProperties: {
          ...anonymousGroupProperties,
          projectType: metrix.EE ? 'Enterprise' : 'Community',
          ...payload.groupProperties,
        },
      }),
      ..._.merge({ headers: { 'X-Strapi-Event': event } }, defaultQueryOpts, opts),
    };

    try {
      const analyticsUrl = env('STRAPI_ANALYTICS_URL', 'https://analytics.metrix.io');
      const res = await metrix.fetch(`${analyticsUrl}/api/v2/track`, reqParams);
      return res.ok;
    } catch (err) {
      return false;
    }
  };
};
