const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const pool = require('./index');

const schemaPath = path.resolve(__dirname, 'schema.sql');

const products = [
  {
    name: 'Starter Tee',
    description: 'Soft cotton t-shirt for everyday wear.',
    price: '19.99',
    stock_quantity: 10,
    image_url: 'https://example.com/images/starter-tee.jpg'
  },
  {
    name: 'Canvas Tote',
    description: 'Durable tote bag with reinforced handles.',
    price: '14.50',
    stock_quantity: 8,
    image_url: 'https://example.com/images/canvas-tote.jpg'
  },
  {
    name: 'Classic Mug',
    description: 'Ceramic mug for coffee, tea, and more.',
    price: '11.00',
    stock_quantity: 15,
    image_url: 'https://example.com/images/classic-mug.jpg'
  },
  {
    name: 'Notebook Set',
    description: 'Three-pack of lined notebooks.',
    price: '17.25',
    stock_quantity: 12,
    image_url: 'https://example.com/images/notebook-set.jpg'
  },
  {
    name: 'Desk Lamp',
    description: 'Adjustable task lamp with warm light.',
    price: '39.95',
    stock_quantity: 6,
    image_url: 'https://example.com/images/desk-lamp.jpg'
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
