import { db } from '@/db';

import { DictTable, DictTableUpdate, NewDictTable } from './dictTableModel';

export const dictTableRepository = {
  findById: async (id: number): Promise<DictTable | null> => {
    const result = await db.selectFrom('catalog.dict_table').where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findByDictionaryId: async (dictionary_id: number): Promise<DictTable | null> => {
    const result = await db
      .selectFrom('catalog.dict_table')
      .where('dictionary_id', '=', dictionary_id)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  findByName: async (name: string): Promise<DictTable | null> => {
    const result = await db.selectFrom('catalog.dict_table').where('name', '=', name).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findAll: async (name?: string): Promise<DictTable[]> => {
    let query = db.selectFrom('catalog.dict_table').selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  create: async (dictTable: NewDictTable): Promise<DictTable> => {
    return await db
      .insertInto('catalog.dict_table')
      .values({
        ...dictTable,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, dictTable: DictTableUpdate): Promise<DictTable | null> => {
    const result = await db
      .updateTable('catalog.dict_table')
      .set({ ...dictTable, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.dict_table').where('id', '=', id).execute();
  },
};
