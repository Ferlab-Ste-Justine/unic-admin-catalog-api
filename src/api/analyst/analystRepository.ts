import pool from '../../db';
import { Analyst } from './analystModel';

export const analystRepository = {
  createAnalyst: async (analyst: Omit<Analyst, 'id'>): Promise<Analyst> => {
    const { name } = analyst;
    const query = `
            INSERT INTO catalog.analyst (name, last_update)
            VALUES ($1, NOW()) RETURNING id, last_update, name;
        `;
    const values = [name];
    const res = await pool.query(query, values);
    return res.rows[0];
  },

  findAnalystById: async (id: number): Promise<Analyst | null> => {
    const query = `SELECT *
                       FROM catalog.analyst
                       WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  },

  findAllAnalysts: async (name?: string): Promise<Analyst[]> => {
    let query = `SELECT *
                     FROM catalog.analyst`;
    const values: any[] = [];

    if (name) {
      query += ` WHERE name ILIKE $1`;
      values.push(`%${name}%`);
    }

    const res = await pool.query(query, values);
    return res.rows;
  },

  updateAnalyst: async (id: number, analyst: Omit<Analyst, 'id' | 'last_update'>): Promise<Analyst | null> => {
    const { name } = analyst;
    const query = `
            UPDATE catalog.analyst
            SET name        = $1,
                last_update = NOW()
            WHERE id = $2 RETURNING id, last_update, name;
        `;
    const values = [name, id];
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  },

  deleteAnalyst: async (id: number): Promise<void> => {
    const query = `DELETE
                       FROM catalog.analyst
                       WHERE id = $1`;
    await pool.query(query, [id]);
  },
};
