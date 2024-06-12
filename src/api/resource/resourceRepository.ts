import { db } from '@/db';

import { NewResource, Resource, ResourceUpdate } from './resourceModel';

export const resourceRepository = {
  findAll: async (name?: string): Promise<Resource[]> => {
    let query = db.selectFrom('catalog.resource').selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  findById: async (id: number): Promise<Resource | null> => {
    const result = await db.selectFrom('catalog.resource').where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findByCode: async (code: string): Promise<Resource | null> => {
    const result = await db.selectFrom('catalog.resource').where('code', '=', code).selectAll().executeTakeFirst();

    return result ?? null;
  },

  create: async (resource: NewResource): Promise<Resource> => {
    return await db.insertInto('catalog.resource').values(resource).returningAll().executeTakeFirstOrThrow();
  },

  update: async (id: number, resource: ResourceUpdate): Promise<Resource | null> => {
    const result = await db
      .updateTable('catalog.resource')
      .set(resource)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.resource').where('id', '=', id).execute();
  },
};
