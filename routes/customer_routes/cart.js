const express = require('express');
const router = express.Router();

const { CartController } = require('../../controllers');

router.get('/', CartController.getAllItemsInCart);
router.post('/', CartController.addToCart);
router.put('/:id', CartController.updateProductQuantity);
router.delete('/:id', CartController.removeItemFromCart);

module.exports = router;