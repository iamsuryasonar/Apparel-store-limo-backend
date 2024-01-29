const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { AdminOrderController } = require('../../controllers');

router.get('/', AdminOrderController.getAllOrders);
// router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }]), AdminOrderController.updateOrder);

module.exports = router;