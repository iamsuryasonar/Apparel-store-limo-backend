const express = require('express');
const router = express.Router();

const { CustomerProductController } = require('../../controllers');

router.get('/keyword/:keyword', CustomerProductController.getProductsByKeyword);
router.get('/products', CustomerProductController.getAllProduct);
router.get('/:id', CustomerProductController.getProductById);
router.get('/category/:id', CustomerProductController.getProductByCategoryId);
router.get('/by_name', CustomerProductController.getProductsByName);
router.get('/by_price', CustomerProductController.getProductsByPrice);

module.exports = router;