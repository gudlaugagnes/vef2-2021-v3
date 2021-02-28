/* eslint-disable import/no-unresolved */
// eslint-disable-next-line import/no-unresolved
import { readFile } from 'fs/promises';
import pg from 'pg';
import faker from 'faker';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const schemaFile = './sql/schema.sql';

async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);

    const { rows } = result;
    return rows;
  } catch (err) {
    console.error('Error running query');
    throw err;
  } finally {
    client.release();
  }
}

async function mock(n) {
  for (let i = 0; i < n; i += 1) {
    const name = faker.name.findName();
    const nationalId = Math.floor(Math.random() * 1000000000);
    let comment = '';
    let anonymous = false;
    if (Math.random() < 0.5) {
      comment = faker.lorem.sentence();
      anonymous = true;
    }
    const q = `
      INSERT INTO signatures (name, nationalId, comment, anonymous)
      VALUES ($1, $2, $3, $4)`;

    // eslint-disable-next-line no-await-in-loop
    await query(q, [name, nationalId, comment, anonymous]);
  }
}

async function create() {
  await query('DROP TABLE IF EXISTS signatures');
  await query('DROP TABLE IF EXISTS users');
  const data = await readFile(schemaFile);

  await query(data.toString('utf-8'));

  console.info('Schema created');

  await mock(500);

  console.info('Mock data inserted');

  await pool.end();
}

create().catch((err) => {
  console.error('Error creating schema', err);
});
