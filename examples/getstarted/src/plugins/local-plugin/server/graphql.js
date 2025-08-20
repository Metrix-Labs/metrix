'use strict';

const crudActionsToDisable = ['create', 'update', 'delete'];

module.exports = ({ metrix }) => {
  const extension = metrix.plugin('graphql').service('extension');

  extension.shadowCRUD('plugin::myplugin.test').disableActions(crudActionsToDisable);
};
