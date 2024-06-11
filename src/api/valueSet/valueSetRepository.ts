import { NewValueSet, ValueSet, ValueSetUpdate } from '@/api/valueSet/valueSetModel';

import { db } from '../../db';

export const valueSetRepository = {
  createValueSet: async (valueSet: NewValueSet): Promise<ValueSet> => {
    return await db
      .insertInto('catalog.value_set')
      .values({
        ...valueSet,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findValueSetById: async (id: number): Promise<ValueSet | null> => {
    const result = await db.selectFrom('catalog.value_set').where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findAllValueSets: async (name?: string): Promise<ValueSet[]> => {
    let query = db.selectFrom('catalog.value_set').selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  updateValueSet: async (id: number, valueSet: ValueSetUpdate): Promise<ValueSet | null> => {
    const result = await db
      .updateTable('catalog.value_set')
      .set({
        ...valueSet,
        last_update: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  deleteValueSet: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.value_set').where('id', '=', id).execute();
  },
};
