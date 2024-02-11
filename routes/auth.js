const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers');

router.post('/customer_register', AuthController.customerRegistration);
router.post('/customer_login', AuthController.customerLogIn);

router.post('/admin_register', AuthController.adminRegistration);
router.post('/admin_login', AuthController.adminLogIn);
module.exports = router;