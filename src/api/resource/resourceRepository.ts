import { db } from '@/db';
import { ANALYST_TABLE, RESOURCE_TABLE, SortOrder } from '@/types';

import { NewResource, Resource, ResourceSearchFields, ResourceSortColumn, ResourceUpdate } from './resourceModel';

export const resourceRepository = {
  findAll: async (
    searchField?: ResourceSearchFields,
    searchValue?: string,
    sortBy?: ResourceSortColumn,
    sortOrder: SortOrder = 'asc'
  ): Promise<Resource[]> => {
    let query = db
      .selectFrom(RESOURCE_TABLE)
      .leftJoin(ANALYST_TABLE, `${RESOURCE_TABLE}.analyst_id`, `${ANALYST_TABLE}.id`)
      .selectAll(RESOURCE_TABLE)
      .select([`${ANALYST_TABLE}.name as analyst_name`]);

    if (searchField && searchValue) {
      query = query.where(`${RESOURCE_TABLE}.${searchField}`, 'like', `%${searchValue}%`);
    }

    if (sortBy) {
      query = query.orderBy(`${RESOURCE_TABLE}.${sortBy}`, sortOrder);
    }

    return await query.execute();
  },

  findById: async (id: number): Promise<Resource | null> => {
    const result = await db
      .selectFrom(RESOURCE_TABLE)
      .leftJoin(ANALYST_TABLE, `${RESOURCE_TABLE}.analyst_id`, `${ANALYST_TABLE}.id`)
      .selectAll(RESOURCE_TABLE)
      .select([`${ANALYST_TABLE}.name as analyst_name`])
      .where(`${RESOURCE_TABLE}.id`, '=', id)
      .executeTakeFirst();

    return result ?? null;
  },

  findByCode: async (code: string): Promise<Resource | null> => {
    const result = await db.selectFrom(RESOURCE_TABLE).where('code', '=', code).selectAll().executeTakeFirst();

    return result ?? null;
  },

  create: async (resource: NewResource): Promise<Resource> => {
    return await db
      .insertInto(RESOURCE_TABLE)
      .values({
        ...resource,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, resource: ResourceUpdate): Promise<Resource | null> => {
    const result = await db
      .updateTable(RESOURCE_TABLE)
      .set({
        ...resource,
        last_update: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom(RESOURCE_TABLE).where('id', '=', id).execute();
  },
};
