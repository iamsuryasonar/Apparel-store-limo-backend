const express = require('express');
const router = express.Router();

const { OrderController } = require('../../controllers');

router.get('/', OrderController.getOrdereditems);
router.post('/', OrderController.createOrder);
router.put('/:id', OrderController.cancelOrder);
router.get('/cancelled_items', OrderController.getCancelledOrder);
module.exports = router;