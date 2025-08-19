'use strict';

const { curry } = require('lodash/fp');
const { traverseEntity, async } = require('@metrix/utils');

const { removeUserRelationFromRoleEntities } = require('./visitors');

const sanitizeUserRelationFromRoleEntities = curry((schema, entity) => {
  return traverseEntity(
    removeUserRelationFromRoleEntities,
    { schema, getModel: metrix.getModel.bind(metrix) },
    entity
  );
});

const defaultSanitizeOutput = curry((schema, entity) => {
  return async.pipe(sanitizeUserRelationFromRoleEntities(schema))(entity);
});

module.exports = {
  sanitizeUserRelationFromRoleEntities,
  defaultSanitizeOutput,
};
