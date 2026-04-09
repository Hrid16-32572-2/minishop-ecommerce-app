const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.type('application/json');
  res.sendEnvelope = (statusCode, success, data, error) => {
    res.status(statusCode).json({
      success,
      data,
      error
    });
  };
  next();
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(express.static('client'));
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/auth', authRoutes);

app.use((req, res) => {
  res.sendEnvelope(404, false, null, 'NOT_FOUND');
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  res.sendEnvelope(500, false, null, 'INTERNAL_SERVER_ERROR');
});

module.exports = app;
