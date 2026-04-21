const pool = require('../db/index');

function parseId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function listProducts(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, stock_quantity, image_url, is_active
       FROM products
       WHERE is_active = true
       ORDER BY id ASC`
    );

    res.sendEnvelope(200, true, result.rows, null);
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  const productId = parseId(req.params.id);

  if (!productId) {
    res.sendEnvelope(400, false, null, 'INVALID_INPUT');
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, name, description, price, stock_quantity, image_url, is_active
       FROM products
       WHERE id = $1
       LIMIT 1`,
      [productId]
    );

    if (result.rowCount === 0) {
      res.sendEnvelope(404, false, null, 'NOT_FOUND');
      return;
    }

    res.sendEnvelope(200, true, result.rows[0], null);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  const imageUrl = typeof req.body?.image_url === 'string' ? req.body.image_url.trim() : '';
  const price = Number.parseFloat(String(req.body?.price ?? '').trim());
  const stockQuantity = Number.parseInt(String(req.body?.stock_quantity ?? '').trim(), 10);

  if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    res.sendEnvelope(400, false, null, 'INVALID_INPUT');
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock_quantity, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id, name, description, price, stock_quantity, image_url, is_active`,
      [name, description || null, price.toFixed(2), stockQuantity, imageUrl || null]
    );

    res.sendEnvelope(201, true, result.rows[0], null);
  } catch (error) {
    next(error);
  }
}

async function updateProductStock(req, res, next) {
  const productId = parseId(req.params.id);
  const stockQuantity = Number.parseInt(req.body?.stock_quantity, 10);

  if (!productId || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    res.sendEnvelope(400, false, null, 'INVALID_INPUT');
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET stock_quantity = $1
       WHERE id = $2
       RETURNING id, name, description, price, stock_quantity, image_url, is_active`,
      [stockQuantity, productId]
    );

    if (result.rowCount === 0) {
      res.sendEnvelope(404, false, null, 'NOT_FOUND');
      return;
    }

    res.sendEnvelope(200, true, result.rows[0], null);
  } catch (error) {
    next(error);
  }
}

async function softDeleteProduct(req, res, next) {
  const productId = parseId(req.params.id);

  if (!productId) {
    res.sendEnvelope(400, false, null, 'INVALID_INPUT');
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET is_active = false
       WHERE id = $1
       RETURNING id, name, description, price, stock_quantity, image_url, is_active`,
      [productId]
    );

    if (result.rowCount === 0) {
      res.sendEnvelope(404, false, null, 'NOT_FOUND');
      return;
    }

    res.sendEnvelope(200, true, result.rows[0], null);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  softDeleteProduct,
  updateProductStock
};
