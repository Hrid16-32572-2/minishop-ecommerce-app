const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');

dotenv.config();

const app = express();
const api = express.Router();

api.use((req, res, next) => {
  res.sendEnvelope = (statusCode, success, data, error) => {
    res.type('application/json').status(statusCode).json({
      success,
      data,
      error
    });
  };
  next();
});

app.use(cors());
app.use(morgan('dev'));
api.use(express.json());

app.use(express.static('client'));
api.use('/products', productRoutes);
api.use('/orders', orderRoutes);
api.use('/auth', authRoutes);
app.use('/api/v1', api);

api.use((req, res) => {
  res.sendEnvelope(404, false, null, 'NOT_FOUND');
});

api.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof SyntaxError && Object.prototype.hasOwnProperty.call(error, 'body')) {
    res.sendEnvelope(400, false, null, 'INVALID_INPUT');
    return;
  }

  res.sendEnvelope(500, false, null, 'INTERNAL_SERVER_ERROR');
});

module.exports = app;
