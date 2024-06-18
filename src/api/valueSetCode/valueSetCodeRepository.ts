import { db } from '@/db';
import { VALUE_SET_CODE_TABLE } from '@/types';

import { NewValueSetCode, ValueSetCode, ValueSetCodeUpdate } from './valueSetCodeModel';

export const valueSetCodeRepository = {
  findAll: async (): Promise<ValueSetCode[]> => {
    return await db.selectFrom(VALUE_SET_CODE_TABLE).selectAll().execute();
  },

  findById: async (id: number): Promise<ValueSetCode | null> => {
    const result = await db.selectFrom(VALUE_SET_CODE_TABLE).where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findByValueSetId: async (value_set_id: number): Promise<ValueSetCode | null> => {
    const result = await db
      .selectFrom(VALUE_SET_CODE_TABLE)
      .where('value_set_id', '=', value_set_id)
      .selectAll()
      .executeTakeFirst();
    return result ?? null;
  },

  findByCode: async (code: string): Promise<ValueSetCode | null> => {
    const result = await db.selectFrom(VALUE_SET_CODE_TABLE).where('code', '=', code).selectAll().executeTakeFirst();
    return result ?? null;
  },

  create: async (valueSetCode: NewValueSetCode): Promise<ValueSetCode> => {
    return await db
      .insertInto(VALUE_SET_CODE_TABLE)
      .values({
        ...valueSetCode,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, valueSetCode: ValueSetCodeUpdate): Promise<ValueSetCode | null> => {
    const result = await db
      .updateTable(VALUE_SET_CODE_TABLE)
      .set({ ...valueSetCode, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom(VALUE_SET_CODE_TABLE).where('id', '=', id).execute();
  },
};
