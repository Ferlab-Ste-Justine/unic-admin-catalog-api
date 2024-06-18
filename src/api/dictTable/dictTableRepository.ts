import { db } from '@/db';
import { DICT_TABLE_TABLE, SortOrder } from '@/types';

import { DictTable, DictTableSearchFields, DictTableSortColumn, DictTableUpdate, NewDictTable } from './dictTableModel';

export const dictTableRepository = {
  findAll: async (
    searchField?: DictTableSearchFields,
    searchValue?: string,
    sortBy?: DictTableSortColumn,
    sortOrder: SortOrder = 'asc'
  ): Promise<DictTable[]> => {
    let query = db.selectFrom(DICT_TABLE_TABLE).selectAll();

    if (searchField && searchValue) {
      query = query.where(`${DICT_TABLE_TABLE}.${searchField}`, 'like', `%${searchValue}%`);
    }

    if (sortBy) {
      query = query.orderBy(`${DICT_TABLE_TABLE}.${sortBy}`, sortOrder);
    }
    return await query.execute();
  },

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
