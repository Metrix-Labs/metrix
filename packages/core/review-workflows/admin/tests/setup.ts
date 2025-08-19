import { server } from '@metrix/admin/metrix-admin/test';

import { HANDLERS } from './handlers';

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  server.use(...HANDLERS);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
