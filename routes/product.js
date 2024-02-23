const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multerConfig');
const authMiddleware = require('../middlewares/authMiddleware')
const { ProductController } = require('../controllers');

router.get('/', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), ProductController.getAllProducts);//published + unpublished products
router.get('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), ProductController.getProductById); //published + unpublished product
router.get('/public/products', ProductController.getAllPublishedProducts); //only published products
router.get('/public/:id', ProductController.getPublishedProductById); //only published product
router.get('/keyword/:keyword', ProductController.getProductsByKeyword); //only published products
router.get('/tag/:tag', ProductController.getProductsByTag); //only published products
router.get('/category/:id', ProductController.getProductsByCategoryId); //only published products
router.get('/by_name/:name', ProductController.getProductsByName); //only published products

router.post('/', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.fields([{ name: 'colorVariantThumbnail', maxCount: 1 }, { name: 'images', maxCount: 6 }]), ProductController.addProduct);
router.post('/add_image/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.fields([{ name: 'image', maxCount: 1 }]), ProductController.add_color_variant_image);
router.post('/add_size/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.none(), ProductController.addSizeVariant);

router.put('/add_color_and_sizes', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.fields([{ name: 'colorVariantThumbnail', maxCount: 1 }, { name: 'images', maxCount: 6 }]), ProductController.addColorAndItsSizeVariant);
router.put('/toggle_is_published/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), ProductController.toggleIsPublished);
router.put('/product_info/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.none(), ProductController.updateProductInfo);
router.put('/update_size/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.none(), ProductController.update_size_variant);
router.put('/update_thumbnail/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.fields([{ name: 'thumbnail', maxCount: 1 }]), ProductController.update_thumbnail_image);
router.put('/update_image/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), upload.fields([{ name: 'image', maxCount: 1 }]), ProductController.update_color_variant_image);

router.delete('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), ProductController.deleteProduct);

module.exports = router;