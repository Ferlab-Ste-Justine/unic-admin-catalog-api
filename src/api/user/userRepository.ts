import bcrypt from 'bcrypt';

import pool from '../../db';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export const createUser = async (user: User): Promise<User> => {
  const { name, email, password } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
        INSERT INTO catalog.user (name, email, password, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, name, email, created_at, updated_at;
    `;
  const values = [name, email, hashedPassword];
  const res = await pool.query(query, values);
  return res.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = `SELECT *
                   FROM catalog.user
                   WHERE email = $1`;
  const res = await pool.query(query, [email]);
  return res.rows[0] || null;
};

export const findAllUsers = async (): Promise<User[]> => {
  const query = `SELECT id, name, email, created_at, updated_at
                   FROM catalog.user`;
  const res = await pool.query(query);
  return res.rows;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const query = `SELECT id, name, email, created_at, updated_at
                   FROM catalog.user
                   WHERE id = $1`;
  const res = await pool.query(query, [id]);
  return res.rows[0] || null;
};
