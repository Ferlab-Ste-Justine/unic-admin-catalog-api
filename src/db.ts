import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { Database } from './types'; // this is the Database interface we defined earlier

const dialect = new PostgresDialect({
  pool: new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
