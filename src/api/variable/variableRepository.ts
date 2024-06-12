import { db } from '@/db';

import { NewVariable, Variable, VariableUpdate } from './variableModel';

export const variableRepository = {
  createVariable: async (variable: NewVariable): Promise<Variable> => {
    return await db
      .insertInto('catalog.variable')
      .values({
        ...variable,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  findVariableById: async (id: number): Promise<Variable | null> => {
    const result = await db.selectFrom('catalog.variable').where('id', '=', id).selectAll().executeTakeFirst();
    return result ?? null;
  },

  findAllVariables: async (name?: string): Promise<Variable[]> => {
    let query = db.selectFrom('catalog.variable').selectAll();

    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }

    return await query.execute();
  },

  updateVariable: async (id: number, variable: VariableUpdate): Promise<Variable | null> => {
    const result = await db
      .updateTable('catalog.variable')
      .set({ ...variable, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  deleteVariable: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.variable').where('id', '=', id).execute();
  },
};
