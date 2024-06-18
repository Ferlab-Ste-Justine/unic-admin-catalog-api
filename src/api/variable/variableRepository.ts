import { db } from '@/db';
import { DICT_TABLE_TABLE, SortOrder, VALUE_SET_TABLE, VARIABLE_TABLE } from '@/types';

import { NewVariable, Variable, VariableSearchFields, VariableSortColumn, VariableUpdate } from './variableModel';

export const variableRepository = {
  findAll: async (
    searchField?: VariableSearchFields,
    searchValue?: string,
    sortBy?: VariableSortColumn,
    sortOrder: SortOrder = 'asc',
    limit: number = 50,
    offset: number = 0
  ): Promise<Variable[]> => {
    let query = db
      .selectFrom(VARIABLE_TABLE)
      .leftJoin(DICT_TABLE_TABLE, `${VARIABLE_TABLE}.table_id`, `${DICT_TABLE_TABLE}.id`)
      .leftJoin(VALUE_SET_TABLE, `${VARIABLE_TABLE}.value_set_id`, `${VALUE_SET_TABLE}.id`)
      .selectAll(VARIABLE_TABLE)
      .select([`${DICT_TABLE_TABLE}.name as table_name`, `${VALUE_SET_TABLE}.name as value_set_name`]);

    if (searchField && searchValue) {
      query = query.where(`${VARIABLE_TABLE}.${searchField}`, 'like', `%${searchValue}%`);
    }

    if (sortBy) {
      query = query.orderBy(`${VARIABLE_TABLE}.${sortBy}`, sortOrder);
    }

    query = query.limit(limit).offset(offset);

    return await query.execute();
  },

  findById: async (id: number): Promise<Variable | null> => {
    const result = await db
      .selectFrom(VARIABLE_TABLE)
      .leftJoin(DICT_TABLE_TABLE, `${VARIABLE_TABLE}.table_id`, `${DICT_TABLE_TABLE}.id`)
      .leftJoin(VALUE_SET_TABLE, `${VARIABLE_TABLE}.value_set_id`, `${VALUE_SET_TABLE}.id`)
      .selectAll(VARIABLE_TABLE)
      .select([`${DICT_TABLE_TABLE}.name as table_name`, `${VALUE_SET_TABLE}.name as value_set_name`])
      .where(`${VARIABLE_TABLE}.id`, '=', id)
      .executeTakeFirst();

    return result ?? null;
  },

  findByPath: async (path: string): Promise<Variable | null> => {
    const result = await db.selectFrom('catalog.variable').where('path', '=', path).selectAll().executeTakeFirst();
    return result ?? null;
  },

  create: async (variable: NewVariable): Promise<Variable> => {
    return await db
      .insertInto('catalog.variable')
      .values({
        ...variable,
        last_update: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  update: async (id: number, variable: VariableUpdate): Promise<Variable | null> => {
    const result = await db
      .updateTable('catalog.variable')
      .set({ ...variable, last_update: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.deleteFrom('catalog.variable').where('id', '=', id).execute();
  },
};
