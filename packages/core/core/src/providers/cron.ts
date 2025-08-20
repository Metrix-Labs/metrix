import { defineProvider } from './provider';
import createCronService from '../services/cron';

export default defineProvider({
  init(metrix) {
    metrix.add('cron', () => createCronService());
  },
  async bootstrap(metrix) {
    if (metrix.config.get('server.cron.enabled', true)) {
      const cronTasks = metrix.config.get('server.cron.tasks', {});
      metrix.get('cron').add(cronTasks);
    }

    metrix.get('cron').start();
  },
  async destroy(metrix) {
    metrix.get('cron').destroy();
  },
});
