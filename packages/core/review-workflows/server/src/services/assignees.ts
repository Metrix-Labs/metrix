import type { Core, UID, Modules } from '@metrix/types';
import { errors } from '@metrix/utils';
import { isNil } from 'lodash/fp';
import { ENTITY_ASSIGNEE_ATTRIBUTE } from '../constants/workflows';
import { getService, getAdminService } from '../utils';

const { ApplicationError } = errors;

export default ({ metrix }: { metrix: Core.Strapi }) => {
  const metrics = getService('workflow-metrics', { metrix });

  return {
    async findEntityAssigneeId(id: string | number, model: UID.ContentType) {
      const entity = await metrix.db.query(model).findOne({
        where: { id },
        populate: [ENTITY_ASSIGNEE_ATTRIBUTE],
        select: [],
      });

      return entity?.[ENTITY_ASSIGNEE_ATTRIBUTE]?.id ?? null;
    },

    /**
     * Update the assignee of an entity
     */
    async updateEntityAssignee(
      entityToUpdate: {
        id: number | string;
        documentId: string;
        locale: string;
        updatedAt: string;
      },
      model: UID.ContentType,
      assigneeId: string | null
    ) {
      const { documentId, locale } = entityToUpdate;

      if (!isNil(assigneeId)) {
        const userExists = await getAdminService('user', { metrix }).exists({ id: assigneeId });

        if (!userExists) {
          throw new ApplicationError(`Selected user does not exist`);
        }
      }

      const oldAssigneeId = await this.findEntityAssigneeId(entityToUpdate.id, model);
      metrics.sendDidEditAssignee(oldAssigneeId, assigneeId || null);

      const entity = await metrix.documents(model).update({
        documentId,
        locale,
        data: { [ENTITY_ASSIGNEE_ATTRIBUTE]: assigneeId || null },
        populate: [ENTITY_ASSIGNEE_ATTRIBUTE],
        fields: [],
      });

      // Update the `updated_at` field of the entity, so that the `status` is not considered `Modified`
      // NOTE: `updatedAt` is a protected attribute that can not be modified directly from the query layer
      //        hence the knex query builder is used here.
      const { tableName } = metrix.db.metadata.get(model);
      await metrix.db
        .connection(tableName)
        .where({ id: entityToUpdate.id })
        .update({
          updated_at: new Date(entityToUpdate.updatedAt),
        });

      return entity;
    },
  };
};
