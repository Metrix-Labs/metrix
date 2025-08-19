import permissions from '@metrixlabs/permissions';
import { providerFactory } from '@metrixlabs/utils';

const DEFAULT_TRANSFER_ACTIONS = ['push', 'pull'];

const providers = {
  action: providerFactory(),
  condition: providerFactory(),
};

DEFAULT_TRANSFER_ACTIONS.forEach((action) => {
  providers.action.register(action, { action });
});

const engine = permissions.engine.new({ providers });

export { engine, providers };
