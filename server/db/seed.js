const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const pool = require('./index');

const schemaPath = path.resolve(__dirname, 'schema.sql');

const products = [
  {
    name: 'Premium Leather Bag',
    description: 'Full-grain leather crossbody bag with reinforced stitching.',
    price: '129.99',
    stock_quantity: 10,
    image_url: 'https://example.com/images/premium-leather-bag.jpg'
  },
  {
    name: 'Minimalist Wall Clock',
    description: 'Silent quartz wall clock with matte aluminum frame.',
    price: '49.50',
    stock_quantity: 8,
    image_url: 'https://example.com/images/minimalist-wall-clock.jpg'
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Breathable mesh chair with adjustable lumbar support.',
    price: '239.00',
    stock_quantity: 15,
    image_url: 'https://example.com/images/ergonomic-office-chair.jpg'
  },
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: '189.25',
    stock_quantity: 12,
    image_url: 'https://example.com/images/wireless-headphones.jpg'
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall insulated bottle that keeps drinks cold for 24 hours.',
    price: '29.95',
    stock_quantity: 6,
    image_url: 'https://example.com/images/stainless-water-bottle.jpg'
  }
];

function getDatabaseName(connectionString) {
  return new URL(connectionString).pathname.replace(/^\//, '');
}

function getAdminConnectionString(connectionString) {
  const parsed = new URL(connectionString);
  parsed.pathname = '/postgres';
  return parsed.toString();
}

async function ensureDatabase() {
  const databaseName = getDatabaseName(process.env.DATABASE_URL);
  const adminClient = new Client({
    connectionString: getAdminConnectionString(process.env.DATABASE_URL)
  });

  await adminClient.connect();

  try {
    const existing = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (existing.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await adminClient.end();
  }
}

async function applySchema() {
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schemaSql);
}

async function runSeed() {
  await ensureDatabase();
  await applySchema();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [5001001]);
    await client.query(
      'TRUNCATE TABLE order_items, orders, products, users RESTART IDENTITY CASCADE'
    );

    const passwordHash = await bcrypt.hash('admin123', 10);

    await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      ['admin@minishop.com', passwordHash, 'admin']
    );

    for (const product of products) {
      await client.query(
        `INSERT INTO products (name, description, price, stock_quantity, image_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product.name,
          product.description,
          product.price,
          product.stock_quantity,
          product.image_url,
          true
        ]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('Seed completed.');
      return pool.end();
    })
    .catch(async (error) => {
      console.error(error);
      await pool.end();
      process.exitCode = 1;
    });
}

module.exports = {
  runSeed
};
