const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { AdminOrderController } = require('../../controllers');

router.get('/', AdminOrderController.getAllOrders);
router.get('/get_product_by_id/:id', AdminOrderController.getAnOrder);
router.put('/:id', AdminOrderController.updateOrderStatus);
router.get('/ordered', AdminOrderController.getAllOrderedOrders);
router.get('/processed', AdminOrderController.getAllProcessedOrders);
router.get('/cancelled', AdminOrderController.getAllCancelledOrders);
router.get('/transit', AdminOrderController.getAllTransitOrders);
router.get('/delivered', AdminOrderController.getAllDeliveredOrders);
module.exports = router;