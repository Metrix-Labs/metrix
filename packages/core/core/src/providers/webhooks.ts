import { defineProvider } from './provider';
import { createWebhookStore, webhookModel } from '../services/webhook-store';
import createWebhookRunner from '../services/webhook-runner';

export default defineProvider({
  init(metrix) {
    metrix.get('models').add(webhookModel);

    metrix.add('webhookStore', () => createWebhookStore({ db: metrix.db }));
    metrix.add('webhookRunner', () =>
      createWebhookRunner({
        eventHub: metrix.eventHub,
        logger: metrix.log,
        configuration: metrix.config.get('server.webhooks', {}),
        fetch: metrix.fetch,
      })
    );
  },
  async bootstrap(metrix) {
    const webhooks = await metrix.get('webhookStore').findWebhooks();
    if (!webhooks) {
      return;
    }

    for (const webhook of webhooks) {
      metrix.get('webhookRunner').add(webhook);
    }
  },
});
