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

module.exports = {
  getProductById,
  listProducts
};
