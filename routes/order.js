const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const { OrderController } = require('../controllers');

router.get('/', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), OrderController.getAllOrders);
router.get('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), OrderController.getAnOrder);
router.get('/status/:status', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), OrderController.getAllOrdersByStatus);
router.get('/orders/ordered', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), OrderController.getOrdereditemsOfUser);
router.get('/orders/cancelled', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), OrderController.getCancelledOrdersOfUser);
router.get('/orders/most_ordered_products', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), OrderController.getMostOrderedProducts);
router.post('/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), OrderController.createOrder);
router.put('/status/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), OrderController.updateOrderStatus);
router.put('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), OrderController.cancelOrder);

module.exports = router;