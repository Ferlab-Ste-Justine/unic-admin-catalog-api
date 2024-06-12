import { db } from '../../db';
import { NewValueSetCode, ValueSetCode, ValueSetCodeUpdate } from './valueSetCodeModel';

export const valueSetCodeRepository = {
  createValueSetCode: async (valueSetCode: NewValueSetCode): Promise<ValueSetCode> => {
    return await db
      .insertInto('catalog.value_set_code')
      .values({
        ...valueSetCode,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findValueSetCodeById: async (id: number): Promise<ValueSetCode | null> => {
    const result = await db.selectFrom('catalog.value_set_code').where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findAllValueSetCodes: async (value_set_id?: string): Promise<ValueSetCode[]> => {
    let query = db.selectFrom('catalog.value_set_code').selectAll();

    if (value_set_id) {
      query = query.where('value_set_id', '=', parseInt(value_set_id, 10));
    }

    return await query.execute();
  },

  updateValueSetCode: async (id: number, valueSetCode: ValueSetCodeUpdate): Promise<ValueSetCode | null> => {
    const result = await db
      .updateTable('catalog.value_set_code')
      .set({ ...valueSetCode, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  deleteValueSetCode: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.value_set_code').where('id', '=', id).execute();
  },
};
