import type { Core } from '@metrixlabs/types';

import loadSrcIndex from './src-index';
import loadAPIs from './apis';
import loadMiddlewares from './middlewares';
import loadComponents from './components';
import loadPolicies from './policies';
import loadPlugins from './plugins';
import loadSanitizers from './sanitizers';
import loadValidators from './validators';

export async function loadApplicationContext(metrix: Core.Strapi) {
  await Promise.all([
    loadSrcIndex(metrix),
    loadSanitizers(metrix),
    loadValidators(metrix),
    loadPlugins(metrix),
    loadAPIs(metrix),
    loadComponents(metrix),
    loadMiddlewares(metrix),
    loadPolicies(metrix),
  ]);
}
