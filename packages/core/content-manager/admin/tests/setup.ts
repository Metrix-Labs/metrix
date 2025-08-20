import { server } from '@metrixlabs/admin/strapi-admin/test';

import { handlers } from './server';

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  server.use(...handlers);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
