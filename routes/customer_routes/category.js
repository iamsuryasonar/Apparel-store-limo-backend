const express = require('express');
const router = express.Router();

const { CategoryController } = require('../../controllers');

router.get('/categories', CategoryController.getAllCategories);

module.exports = router;