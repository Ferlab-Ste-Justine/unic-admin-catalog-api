import { Analyst, AnalystSearchFields, AnalystSortColumn, AnalystUpdate, NewAnalyst } from '@/api/analyst/analystModel';
import { db } from '@/db';
import { ANALYST_TABLE, SortOrder } from '@/types';

export const analystRepository = {
  findAll: async (
    searchField?: AnalystSearchFields,
    searchValue?: string,
    sortBy?: AnalystSortColumn,
    sortOrder: SortOrder = 'asc'
  ): Promise<Analyst[]> => {
    let query = db.selectFrom(ANALYST_TABLE).selectAll();

    if (searchField && searchValue) {
      query = query.where(`${ANALYST_TABLE}.${searchField}`, 'like', `%${searchValue}%`);
    }

    if (sortBy) {
      query = query.orderBy(`${ANALYST_TABLE}.${sortBy}`, sortOrder);
    }
    return await query.execute();
  },

  findById: async (id: number): Promise<Analyst | null> => {
    const result = await db.selectFrom(ANALYST_TABLE).where('id', '=', id).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findByName: async (name: string): Promise<Analyst | null> => {
    const result = await db.selectFrom(ANALYST_TABLE).where('name', '=', name).selectAll().executeTakeFirst();

    return result ?? null;
  },

  create: async (analyst: NewAnalyst): Promise<Analyst> => {
    return await db
      .insertInto(ANALYST_TABLE)
      .values({
        ...analyst,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, analyst: AnalystUpdate): Promise<Analyst | null> => {
    const result = await db
      .updateTable(ANALYST_TABLE)
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
    await db.deleteFrom(ANALYST_TABLE).where('id', '=', id).execute();
  },
};
