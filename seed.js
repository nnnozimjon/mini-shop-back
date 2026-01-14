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
('Розы'),
('Тюльпаны'),
('Лилии'),
('Орхидеи'),
('Хризантемы'),
('Пионы'),
('Герберы'),
('Букеты'),
('Цветочные композиции'),
('Корзины с цветами'),
('Свадебные букеты'),
('Романтические букеты'),
('Комнатные растения'),
('Сезонные цветы')
    ON CONFLICT (name) DO NOTHING
  `);

  await client.end();
}

seed().then(() => {
  console.log('Categories seeded');
});
