import { server } from '@metrix/admin/metrix-admin/test';

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
