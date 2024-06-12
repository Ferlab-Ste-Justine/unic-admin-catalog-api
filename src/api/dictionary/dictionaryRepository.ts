import { db } from '@/db';

import { Dictionary, DictionaryUpdate, NewDictionary } from './dictionaryModel';

export const dictionaryRepository = {
  createDictionary: async (dictionary: NewDictionary): Promise<Dictionary> => {
    return await db
      .insertInto('catalog.dictionary')
      .values({
        ...dictionary,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findDictionaryById: async (id: number): Promise<Dictionary | null> => {
    const result = await db.selectFrom('catalog.dictionary').where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findAllDictionaries: async (): Promise<Dictionary[]> => {
    return await db.selectFrom('catalog.dictionary').selectAll().execute();
  },

  updateDictionary: async (id: number, dictionary: DictionaryUpdate): Promise<Dictionary | null> => {
    const result = await db
      .updateTable('catalog.dictionary')
      .set({ ...dictionary, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  deleteDictionary: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.dictionary').where('id', '=', id).execute();
  },
};
