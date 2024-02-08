const express = require('express');
const router = express.Router();

const { CustomerProductController } = require('../../controllers');

router.get('/keyword/:keyword', CustomerProductController.getProductsByKeyword);
router.get('/products', CustomerProductController.getAllProduct);
router.get('/product/:id', CustomerProductController.getProductById);
router.get('/category/:id', CustomerProductController.getProductByCategoryId);
router.get('/by-name/:name', CustomerProductController.getProductsByName);

module.exports = router;