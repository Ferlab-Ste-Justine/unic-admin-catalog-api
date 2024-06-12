import { db } from '@/db';

import { Mapping, MappingUpdate, NewMapping } from './mappingModel';

export const mappingRepository = {
  createMapping: async (mapping: NewMapping): Promise<Mapping> => {
    return await db
      .insertInto('catalog.mapping')
      .values({
        ...mapping,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findMappingById: async (id: number): Promise<Mapping | null> => {
    const result = await db.selectFrom('catalog.mapping').where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findAllMappings: async (): Promise<Mapping[]> => {
    return await db.selectFrom('catalog.mapping').selectAll().execute();
  },

  updateMapping: async (id: number, mapping: MappingUpdate): Promise<Mapping | null> => {
    const result = await db
      .updateTable('catalog.mapping')
      .set({ ...mapping, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },
  deleteMapping: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.mapping').where('id', '=', id).execute();
  },
};
