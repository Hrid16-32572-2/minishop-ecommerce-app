const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/index');

async function login(req, res, next) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    res.sendEnvelope(400, false, null, 'INVALID_INPUT');
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rowCount === 0) {
      res.sendEnvelope(401, false, null, 'UNAUTHORIZED');
      return;
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      res.sendEnvelope(401, false, null, 'UNAUTHORIZED');
      return;
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    res.sendEnvelope(200, true, { token }, null);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login
};
