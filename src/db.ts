import * as fs from 'fs';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConnectionOptions } from 'tls';

import { Database } from './types';

const isProduction = process.env.NODE_ENV === 'production';

let sslConfig: boolean | ConnectionOptions = false;

if (isProduction) {
  const caCertPath = process.env.PGSSLROOTCERT;
  if (caCertPath) {
    const caCert = fs.readFileSync(caCertPath).toString();
    sslConfig = {
      rejectUnauthorized: true,
      ca: caCert,
    };
  }
}

const dialect = new PostgresDialect({
  pool: new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: sslConfig,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
