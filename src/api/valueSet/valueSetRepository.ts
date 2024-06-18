import {
  NewValueSet,
  ValueSet,
  ValueSetSearchFields,
  ValueSetSortColumn,
  ValueSetUpdate,
} from '@/api/valueSet/valueSetModel';
import { db } from '@/db';
import { SortOrder, VALUE_SET_TABLE } from '@/types';

export const valueSetRepository = {
  findAll: async (
    searchField?: ValueSetSearchFields,
    searchValue?: string,
    sortBy?: ValueSetSortColumn,
    sortOrder: SortOrder = 'asc'
  ): Promise<ValueSet[]> => {
    let query = db.selectFrom(VALUE_SET_TABLE).selectAll();

    if (searchField && searchValue) {
      query = query.where(`${VALUE_SET_TABLE}.${searchField}`, 'like', `%${searchValue}%`);
    }

    if (sortBy) {
      query = query.orderBy(`${VALUE_SET_TABLE}.${sortBy}`, sortOrder);
    }
    return await query.execute();
  },

  findById: async (id: number): Promise<ValueSet | null> => {
    const result = await db.selectFrom(VALUE_SET_TABLE).where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findByName: async (name: string): Promise<ValueSet | null> => {
    const result = await db.selectFrom(VALUE_SET_TABLE).where('name', '=', name).selectAll().executeTakeFirst();

    return result ?? null;
  },

  create: async (valueSet: NewValueSet): Promise<ValueSet> => {
    return await db
      .insertInto(VALUE_SET_TABLE)
      .values({
        ...valueSet,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, valueSet: ValueSetUpdate): Promise<ValueSet | null> => {
    const result = await db
      .updateTable(VALUE_SET_TABLE)
      .set({
        ...valueSet,
        last_update: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom(VALUE_SET_TABLE).where('id', '=', id).execute();
  },
};
