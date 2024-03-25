const express = require('express');
const router = express.Router();
const { ContactUsController } = require('../controllers');

router.post('/',ContactUsController.sendEmail);

module.exports = router;