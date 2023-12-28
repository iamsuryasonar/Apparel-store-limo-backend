const express = require('express');
const router = express.Router();

const { CustomerProductController } = require('../../controllers');

router.get('/keyword/:keyword', CustomerProductController.getProductByKeyword);
router.get('/products', CustomerProductController.getAllProduct);
router.get('/:ProductId', CustomerProductController.getProductById);


module.exports = router;