const pool = require('../db/index');

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const merged = new Map();

  for (const item of items) {
    const productId = Number.parseInt(item?.product_id, 10);
    const quantity = Number.parseInt(item?.quantity, 10);

    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      return null;
    }

    merged.set(productId, (merged.get(productId) || 0) + quantity);
  }

  return Array.from(merged.entries())
    .map(([product_id, quantity]) => ({ product_id, quantity }))
    .sort((a, b) => a.product_id - b.product_id);
}

async function createOrder(req, res, next) {
  const items = normalizeItems(req.body?.items);

  if (!items) {
    res.sendEnvelope(400, false, null, 'INVALID_INPUT');
    return;
  }

  const client = await pool.connect();
  let transactionOpen = false;

  try {
    await client.query('BEGIN');
    transactionOpen = true;

    const productIds = items.map((item) => item.product_id);
    const lockedProducts = await client.query(
      `SELECT id, price, stock_quantity
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id ASC
       FOR UPDATE`,
      [productIds]
    );

    if (lockedProducts.rowCount !== items.length) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      res.sendEnvelope(404, false, null, 'NOT_FOUND');
      return;
    }

    const productsById = new Map(
      lockedProducts.rows.map((row) => [row.id, row])
    );

    let totalAmount = 0;

    for (const item of items) {
      const product = productsById.get(item.product_id);

      if (product.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        transactionOpen = false;
        res.sendEnvelope(400, false, null, 'INSUFFICIENT_STOCK');
        return;
      }

      totalAmount += Number(product.price) * item.quantity;
    }

    const orderResult = await client.query(
      'INSERT INTO orders (total_amount) VALUES ($1) RETURNING id, total_amount, created_at',
      [totalAmount.toFixed(2)]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const product = productsById.get(item.product_id);

      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, product.price]
      );
    }

    await client.query('COMMIT');
    transactionOpen = false;
    res.sendEnvelope(201, true, order, null);
  } catch (error) {
    if (transactionOpen) {
      await client.query('ROLLBACK');
    }
    next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  createOrder
};
