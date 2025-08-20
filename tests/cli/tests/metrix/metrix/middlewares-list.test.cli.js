'use strict';

const coffee = require('coffee');

const utils = require('../../../utils');

describe('middlewares:list', () => {
  let appPath;

  beforeAll(async () => {
    const testApps = utils.instances.getTestApps();

    appPath = testApps.at(0);
  });

  it('should output list of policies', async () => {
    const { stdout } = await coffee
      .spawn('npm', ['run', '-s', 'metrix', 'middlewares:list'], { cwd: appPath })
      .expect('code', 0)
      .end();

    const output = stdout.trim();

    const expected = `
    ┌─────────────────────────────────────┐
    │ Name                                │
    ├─────────────────────────────────────┤
    │ admin::rateLimit                    │
    ├─────────────────────────────────────┤
    │ admin::data-transfer                │
    ├─────────────────────────────────────┤
    │ metrix::compression                 │
    ├─────────────────────────────────────┤
    │ metrix::cors                        │
    ├─────────────────────────────────────┤
    │ metrix::errors                      │
    ├─────────────────────────────────────┤
    │ metrix::favicon                     │
    ├─────────────────────────────────────┤
    │ metrix::ip                          │
    ├─────────────────────────────────────┤
    │ metrix::logger                      │
    ├─────────────────────────────────────┤
    │ metrix::poweredBy                   │
    ├─────────────────────────────────────┤
    │ metrix::body                        │
    ├─────────────────────────────────────┤
    │ metrix::query                       │
    ├─────────────────────────────────────┤
    │ metrix::responseTime                │
    ├─────────────────────────────────────┤
    │ metrix::responses                   │
    ├─────────────────────────────────────┤
    │ metrix::security                    │
    ├─────────────────────────────────────┤
    │ metrix::session                     │
    ├─────────────────────────────────────┤
    │ metrix::public                      │
    ├─────────────────────────────────────┤
    │ plugin::users-permissions.rateLimit │
    └─────────────────────────────────────┘
    `;

    utils.helpers.expectConsoleLinesToInclude(output, expected);
  });
});
