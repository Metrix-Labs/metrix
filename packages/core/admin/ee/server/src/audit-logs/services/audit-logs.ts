import type { Core } from '@metrix/types';

interface Event {
  action: string;
  date: Date;
  userId: string | number;
  payload: Record<string, unknown>;
}

interface Log extends Omit<Event, 'userId'> {
  user: string | number;
}

const getSanitizedUser = (user: any) => {
  let displayName = user.email;

  if (user.username) {
    displayName = user.username;
  } else if (user.firstname && user.lastname) {
    displayName = `${user.firstname} ${user.lastname}`;
  }

  return {
    id: user.id,
    email: user.email,
    displayName,
  };
};

/**
 * @description
 * Manages audit logs interaction with the database. Accessible via metrix.get('audit-logs')
 */
const createAuditLogsService = (metrix: Core.Strapi) => {
  return {
    async saveEvent(event: Event) {
      const { userId, ...rest } = event;

      const auditLog: Log = { ...rest, user: userId };

      // Save to database
      await metrix.db?.query('admin::audit-log').create({ data: auditLog });

      return this;
    },

    async findMany(query: unknown) {
      const { results, pagination } = await metrix.db?.query('admin::audit-log').findPage({
        populate: ['user'],
        select: ['action', 'date', 'payload'],
        ...metrix.get('query-params').transform('admin::audit-log', query),
      });

      const sanitizedResults = results.map((result: any) => {
        const { user, ...rest } = result;
        return {
          ...rest,
          user: user ? getSanitizedUser(user) : null,
        };
      });

      return {
        results: sanitizedResults,
        pagination,
      };
    },

    async findOne(id: unknown) {
      const result: any = await metrix.db?.query('admin::audit-log').findOne({
        where: { id },
        populate: ['user'],
        select: ['action', 'date', 'payload'],
      });

      if (!result) {
        return null;
      }

      const { user, ...rest } = result;
      return {
        ...rest,
        user: user ? getSanitizedUser(user) : null,
      };
    },

    deleteExpiredEvents(expirationDate: Date) {
      return metrix.db?.query('admin::audit-log').deleteMany({
        where: {
          date: {
            $lt: expirationDate.toISOString(),
          },
        },
      });
    },
  };
};

export { createAuditLogsService };
