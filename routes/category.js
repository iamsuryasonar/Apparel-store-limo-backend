const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer();
const authMiddleware = require('../middlewares/authMiddleware')
const { CategoryController } = require('../controllers');

router.get('/', CategoryController.getAllCategories);
router.post('/', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.fields([{ name: 'image', maxCount: 1 }]), CategoryController.addCategory);
router.put('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.fields([{ name: 'image', maxCount: 1 }]), CategoryController.updateCategory);
// router.delete('/:id',authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'),  AdminCategoryController.deleteCategory);


module.exports = router;