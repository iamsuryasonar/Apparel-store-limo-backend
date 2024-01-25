const express = require('express');
const router = express.Router();
const { CustomerAuthController } = require('../../controllers');

router.post('/customer-register', CustomerAuthController.customerRegistration);
router.post('/customer-login', CustomerAuthController.customerLogIn);

module.exports = router;