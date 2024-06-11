import { Analyst, AnalystUpdate, NewAnalyst } from '@/api/analyst/analystModel';

import { db } from '../../db';

export const analystRepository = {
  createAnalyst: async (analyst: NewAnalyst): Promise<Analyst> => {
    return await db.insertInto('catalog.analyst').values(analyst).returningAll().executeTakeFirstOrThrow();
  },

  findAnalystById: async (id: number): Promise<Analyst | null> => {
    const result = await db.selectFrom('catalog.analyst').where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findAllAnalysts: async (name?: string): Promise<Analyst[]> => {
    let query = db.selectFrom('catalog.analyst').selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  updateAnalyst: async (id: number, analyst: AnalystUpdate): Promise<Analyst | null> => {
    const result = await db
      .updateTable('catalog.analyst')
      .set(analyst)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  deleteAnalyst: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.analyst').where('id', '=', id).execute();
  },
};
