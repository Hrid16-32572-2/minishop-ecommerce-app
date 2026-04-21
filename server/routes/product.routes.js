const express = require('express');
const authenticate = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, productController.createProduct);
router.patch('/:id/stock', authenticate, productController.updateProductStock);
router.delete('/:id', authenticate, productController.softDeleteProduct);

module.exports = router;
