const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { CategoryController } = require('../../controllers');

router.get('/', CategoryController.getAllCategories);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), CategoryController.addCategory);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }]), CategoryController.updateCategory);
// router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;