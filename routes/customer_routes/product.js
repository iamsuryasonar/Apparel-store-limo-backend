const express = require('express');
const router = express.Router();

const { CustomerProductController } = require('../../controllers');

router.get('/keyword/:keyword', CustomerProductController.getProductsByKeyword);
router.get('/products', CustomerProductController.getAllProduct);
router.get('/:id', CustomerProductController.getProductById);
router.get('/category/:id', CustomerProductController.getProductByCategoryId);
router.get('/by-name/:name', CustomerProductController.getProductsByName);
router.get('/by-price/:from/:to', CustomerProductController.getProductsByPrice);

module.exports = router;