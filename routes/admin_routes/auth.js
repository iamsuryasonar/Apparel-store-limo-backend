const express = require('express');
const router = express.Router();

const { AuthController } = require('../../controllers');

router.post('/adminRegister', AuthController.adminRegistration);
router.post('/adminLogin', AuthController.adminLogIn);

module.exports = router;