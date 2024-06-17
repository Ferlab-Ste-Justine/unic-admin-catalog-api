import { db } from '@/db';
import { DICT_TABLE_TABLE } from '@/types';

import { DictTable, DictTableUpdate, NewDictTable } from './dictTableModel';

export const dictTableRepository = {
  findById: async (id: number): Promise<DictTable | null> => {
    const result = await db.selectFrom(DICT_TABLE_TABLE).where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findByDictionaryId: async (dictionary_id: number): Promise<DictTable | null> => {
    const result = await db
      .selectFrom(DICT_TABLE_TABLE)
      .where('dictionary_id', '=', dictionary_id)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  findByName: async (name: string): Promise<DictTable | null> => {
    const result = await db.selectFrom(DICT_TABLE_TABLE).where('name', '=', name).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findAll: async (name?: string): Promise<DictTable[]> => {
    let query = db.selectFrom(DICT_TABLE_TABLE).selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  create: async (dictTable: NewDictTable): Promise<DictTable> => {
    return await db
      .insertInto(DICT_TABLE_TABLE)
      .values({
        ...dictTable,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, dictTable: DictTableUpdate): Promise<DictTable | null> => {
    const result = await db
      .updateTable(DICT_TABLE_TABLE)
      .set({ ...dictTable, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom(DICT_TABLE_TABLE).where('id', '=', id).execute();
  },
};
