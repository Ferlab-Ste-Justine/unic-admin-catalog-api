import { db } from '@/db';

import { Dictionary, DictionaryUpdate, NewDictionary } from './dictionaryModel';

export const dictionaryRepository = {
  findById: async (id: number): Promise<Dictionary | null> => {
    const result = await db.selectFrom('catalog.dictionary').where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findByResourceId: async (resource_id: number): Promise<Dictionary | null> => {
    const result = await db
      .selectFrom('catalog.dictionary')
      .where('resource_id', '=', resource_id)
      .selectAll()
      .executeTakeFirst();

    return result ?? null;
  },

  findAll: async (): Promise<Dictionary[]> => {
    return await db.selectFrom('catalog.dictionary').selectAll().execute();
  },

  create: async (dictionary: NewDictionary): Promise<Dictionary> => {
    return await db
      .insertInto('catalog.dictionary')
      .values({
        ...dictionary,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, dictionary: DictionaryUpdate): Promise<Dictionary | null> => {
    const result = await db
      .updateTable('catalog.dictionary')
      .set({ ...dictionary, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.dictionary').where('id', '=', id).execute();
  },
};
