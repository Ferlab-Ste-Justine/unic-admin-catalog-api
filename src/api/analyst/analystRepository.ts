import { Analyst, AnalystUpdate, NewAnalyst } from '@/api/analyst/analystModel';
import { db } from '@/db';

export const analystRepository = {
  findById: async (id: number): Promise<Analyst | null> => {
    const result = await db.selectFrom('catalog.analyst').where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findByName: async (name: string): Promise<Analyst | null> => {
    const result = await db.selectFrom('catalog.analyst').where('name', '=', name).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findAll: async (name?: string): Promise<Analyst[]> => {
    let query = db.selectFrom('catalog.analyst').selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  create: async (analyst: NewAnalyst): Promise<Analyst> => {
    return await db
      .insertInto('catalog.analyst')
      .values({
        ...analyst,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, analyst: AnalystUpdate): Promise<Analyst | null> => {
    const result = await db
      .updateTable('catalog.analyst')
      .set({
        ...analyst,
        last_update: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.analyst').where('id', '=', id).execute();
  },
};
