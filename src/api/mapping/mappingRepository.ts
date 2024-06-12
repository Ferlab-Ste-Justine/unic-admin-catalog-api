import { db } from '@/db';

import { Mapping, MappingUpdate, NewMapping } from './mappingModel';

export const mappingRepository = {
  findById: async (id: number): Promise<Mapping | null> => {
    const result = await db.selectFrom('catalog.mapping').where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findByValueSetCodeId: async (value_set_code_id: number): Promise<Mapping | null> => {
    const result = await db
      .selectFrom('catalog.mapping')
      .where('value_set_code_id', '=', value_set_code_id)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  findByOriginalValue: async (original_value: string): Promise<Mapping | null> => {
    const result = await db
      .selectFrom('catalog.mapping')
      .where('original_value', '=', original_value)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  create: async (mapping: NewMapping): Promise<Mapping> => {
    return await db
      .insertInto('catalog.mapping')
      .values({
        ...mapping,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findAll: async (): Promise<Mapping[]> => {
    return await db.selectFrom('catalog.mapping').selectAll().execute();
  },

  update: async (id: number, mapping: MappingUpdate): Promise<Mapping | null> => {
    const result = await db
      .updateTable('catalog.mapping')
      .set({ ...mapping, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },
  delete: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.mapping').where('id', '=', id).execute();
  },
};
