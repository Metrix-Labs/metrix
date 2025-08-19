'use strict';

const fs = require('fs');
const path = require('path');

const authStrategy = require('./strategies/users-permissions');
const sanitizers = require('./utils/sanitize/sanitizers');

module.exports = ({ metrix }) => {
  metrix.get('auth').register('content-api', authStrategy);
  metrix.sanitizers.add('content-api.output', sanitizers.defaultSanitizeOutput);

  if (metrix.plugin('graphql')) {
    require('./graphql')({ metrix });
  }

  if (metrix.plugin('documentation')) {
    const specPath = path.join(__dirname, '../../documentation/content-api.yaml');
    const spec = fs.readFileSync(specPath, 'utf8');

    metrix
      .plugin('documentation')
      .service('override')
      .registerOverride(spec, {
        pluginOrigin: 'users-permissions',
        excludeFromGeneration: ['users-permissions'],
      });
  }
};
