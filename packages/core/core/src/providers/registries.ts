import { hooks } from '@metrixlabs/utils';

import { defineProvider } from './provider';
import * as registries from '../registries';
import { loadApplicationContext } from '../loaders';
import * as syncMigrations from '../migrations';
import { discardDocumentDrafts } from '../migrations/database/5.0.0-discard-drafts';

export default defineProvider({
  init(metrix) {
    metrix
      .add('content-types', () => registries.contentTypes())
      .add('components', () => registries.components())
      .add('services', () => registries.services(metrix))
      .add('policies', () => registries.policies())
      .add('middlewares', () => registries.middlewares())
      .add('hooks', () => registries.hooks())
      .add('controllers', () => registries.controllers(metrix))
      .add('modules', () => registries.modules(metrix))
      .add('plugins', () => registries.plugins(metrix))
      .add('custom-fields', () => registries.customFields(metrix))
      .add('apis', () => registries.apis(metrix))
      .add('models', () => registries.models())
      .add('sanitizers', registries.sanitizers())
      .add('validators', registries.validators());
  },
  async register(metrix) {
    await loadApplicationContext(metrix);

    metrix.get('hooks').set('metrix::content-types.beforeSync', hooks.createAsyncParallelHook());
    metrix.get('hooks').set('metrix::content-types.afterSync', hooks.createAsyncParallelHook());

    // Content migration to enable draft and publish
    metrix.hook('metrix::content-types.beforeSync').register(syncMigrations.disable);
    metrix.hook('metrix::content-types.afterSync').register(syncMigrations.enable);

    // Database migrations
    metrix.db.migrations.providers.internal.register(discardDocumentDrafts);
  },
});
