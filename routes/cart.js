const express = require('express');
const router = express.Router();
const { CartController } = require('../controllers');
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), CartController.getAllItemsInCart);
router.post('/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), CartController.addToCart);
router.put('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), CartController.updateProductQuantity);
router.delete('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), CartController.removeItemFromCart);

module.exports = router;