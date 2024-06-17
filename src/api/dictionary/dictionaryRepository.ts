import { db } from '@/db';
import { DICTIONARY_TABLE } from '@/types';

import { Dictionary, DictionaryUpdate, NewDictionary } from './dictionaryModel';

export const dictionaryRepository = {
  findAll: async (): Promise<Dictionary[]> => {
    return await db.selectFrom(DICTIONARY_TABLE).selectAll().execute();
  },

  findById: async (id: number): Promise<Dictionary | null> => {
    const result = await db.selectFrom(DICTIONARY_TABLE).where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findByResourceId: async (resource_id: number): Promise<Dictionary | null> => {
    const result = await db
      .selectFrom(DICTIONARY_TABLE)
      .where('resource_id', '=', resource_id)
      .selectAll()
      .executeTakeFirst();

    return result ?? null;
  },

  create: async (dictionary: NewDictionary): Promise<Dictionary> => {
    return await db
      .insertInto(DICTIONARY_TABLE)
      .values({
        ...dictionary,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, dictionary: DictionaryUpdate): Promise<Dictionary | null> => {
    const result = await db
      .updateTable(DICTIONARY_TABLE)
      .set({ ...dictionary, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom(DICTIONARY_TABLE).where('id', '=', id).execute();
  },
};
