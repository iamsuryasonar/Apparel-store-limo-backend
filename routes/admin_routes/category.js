const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { CategoryController } = require('../../controllers');

router.get('/', CategoryController.getAllCategories);
router.post('/add_category', upload.none(), CategoryController.addCategory);
router.put('/:id', upload.none(), CategoryController.updateCategory);
// router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;