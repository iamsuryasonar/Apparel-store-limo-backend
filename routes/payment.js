const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const { PaymentController } = require('../controllers');

router.post('/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), PaymentController.createPaymentOrder);
router.post('/validate_payment/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), PaymentController.validatePaymentOrder);
module.exports = router;