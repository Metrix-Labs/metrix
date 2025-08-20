import _ from 'lodash';
import { errors, contentTypes as contentTypesUtils } from '@metrixlabs/utils';
import { getService } from '../../utils';

const findEntityAndCheckPermissions = async (
  ability: unknown,
  action: string,
  model: string,
  id: string | number
) => {
  const file = await getService('upload').findOne(id, [
    contentTypesUtils.constants.CREATED_BY_ATTRIBUTE,
    'folder',
  ]);

  if (_.isNil(file)) {
    throw new errors.NotFoundError();
  }

  const pm = metrix
    .service('admin::permission')
    .createPermissionsManager({ ability, action, model });

  const creatorId = _.get(file, [contentTypesUtils.constants.CREATED_BY_ATTRIBUTE, 'id']);
  const author = creatorId
    ? await metrix.service('admin::user').findOne(creatorId, ['roles'])
    : null;

  const fileWithRoles = _.set(_.cloneDeep(file), 'createdBy', author);

  if (pm.ability.cannot(pm.action, pm.toSubject(fileWithRoles))) {
    throw new errors.ForbiddenError();
  }

  return { pm, file };
};

export { findEntityAndCheckPermissions };
