import { db } from '../../db';
import { DictTable, DictTableUpdate, NewDictTable } from './dictTableModel';

export const dictTableRepository = {
  createDictTable: async (dictTable: NewDictTable): Promise<DictTable> => {
    return await db
      .insertInto('catalog.dict_table')
      .values({
        ...dictTable,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findDictTableById: async (id: number): Promise<DictTable | null> => {
    const result = await db.selectFrom('catalog.dict_table').where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findAllDictTables: async (name?: string): Promise<DictTable[]> => {
    let query = db.selectFrom('catalog.dict_table').selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  updateDictTable: async (id: number, dictTable: DictTableUpdate): Promise<DictTable | null> => {
    const result = await db
      .updateTable('catalog.dict_table')
      .set({ ...dictTable, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  deleteDictTable: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.dict_table').where('id', '=', id).execute();
  },
};
