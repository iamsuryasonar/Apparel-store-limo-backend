const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { AdminCategoryController } = require('../../controllers');

router.get('/', AdminCategoryController.getAllCategories);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), AdminCategoryController.addCategory);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }]), AdminCategoryController.updateCategory);
// router.delete('/:id', AdminCategoryController.deleteCategory);

module.exports = router;