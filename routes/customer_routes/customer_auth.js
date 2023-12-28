const express = require('express');
const router = express.Router();
const { CustomerAuthController } = require('../../controllers');

router.post('/customerRegister', CustomerAuthController.customerRegistration);
router.post('/customerLogin', CustomerAuthController.customerLogIn);

module.exports = router;