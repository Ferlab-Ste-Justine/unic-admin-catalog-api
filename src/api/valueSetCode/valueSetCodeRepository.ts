import { db } from '../../db';
import { NewValueSetCode, ValueSetCode, ValueSetCodeUpdate } from './valueSetCodeModel';

export const valueSetCodeRepository = {
  findById: async (id: number): Promise<ValueSetCode | null> => {
    const result = await db.selectFrom('catalog.value_set_code').where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findByValueSetId: async (value_set_id: number): Promise<ValueSetCode | null> => {
    const result = await db
      .selectFrom('catalog.value_set_code')
      .where('value_set_id', '=', value_set_id)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  findByCode: async (code: string): Promise<ValueSetCode | null> => {
    const result = await db
      .selectFrom('catalog.value_set_code')
      .where('code', '=', code)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  findAll: async (): Promise<ValueSetCode[]> => {
    return await db.selectFrom('catalog.value_set_code').selectAll().execute();
  },

  create: async (valueSetCode: NewValueSetCode): Promise<ValueSetCode> => {
    return await db
      .insertInto('catalog.value_set_code')
      .values({
        ...valueSetCode,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, valueSetCode: ValueSetCodeUpdate): Promise<ValueSetCode | null> => {
    const result = await db
      .updateTable('catalog.value_set_code')
      .set({ ...valueSetCode, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.value_set_code').where('id', '=', id).execute();
  },
};
