import { db } from '@/db';
import { MAPPING_TABLE } from '@/types';

import { Mapping, MappingUpdate, NewMapping } from './mappingModel';

export const mappingRepository = {
  findById: async (id: number): Promise<Mapping | null> => {
    const result = await db.selectFrom(MAPPING_TABLE).where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findByValueSetCodeId: async (value_set_code_id: number): Promise<Mapping | null> => {
    const result = await db
      .selectFrom(MAPPING_TABLE)
      .where('value_set_code_id', '=', value_set_code_id)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  findByOriginalValue: async (original_value: string): Promise<Mapping | null> => {
    const result = await db
      .selectFrom(MAPPING_TABLE)
      .where('original_value', '=', original_value)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  create: async (mapping: NewMapping): Promise<Mapping> => {
    return await db
      .insertInto(MAPPING_TABLE)
      .values({
        ...mapping,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findAll: async (): Promise<Mapping[]> => {
    return await db.selectFrom(MAPPING_TABLE).selectAll().execute();
  },

  update: async (id: number, mapping: MappingUpdate): Promise<Mapping | null> => {
    const result = await db
      .updateTable(MAPPING_TABLE)
      .set({ ...mapping, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },
  delete: async (id: number): Promise<void> => {
    await db.deleteFrom(MAPPING_TABLE).where('id', '=', id).execute();
  },
};
