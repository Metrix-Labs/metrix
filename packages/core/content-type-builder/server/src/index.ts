// eslint-disable-next-line import/no-extraneous-dependencies
import '@metrixlabs/types';

import config from './config';
import bootstrap from './bootstrap';
import services from './services';
import controllers from './controllers';
import routes from './routes';

export default () => ({
  config,
  bootstrap,
  services,
  controllers,
  routes,
});
