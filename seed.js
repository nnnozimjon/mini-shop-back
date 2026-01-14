import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'mini_shop',
});

async function seed() {
  await client.connect();

  await client.query(`
    INSERT INTO categories (name)
    VALUES
      ('Electronics'),
      ('Clothing'),
      ('Books'),
      ('Home')
    ON CONFLICT (name) DO NOTHING
  `);

  await client.end();
}

seed().then(() => {
  console.log('Categories seeded');
});
