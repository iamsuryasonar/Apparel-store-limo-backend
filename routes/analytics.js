const express = require('express');
const multer = require('multer');
const router = express.Router();
const { AnalyticsController } = require('../controllers');

router.get('/', AnalyticsController.getAnalytics);

module.exports = router;