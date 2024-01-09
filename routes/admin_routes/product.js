const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload, convertToWebp } = require('../../middlewares/multerConfig');
const { AdminProductController } = require('../../controllers');

router.get('/:id', AdminProductController.getProductById);
router.get('/', AdminProductController.getAllProducts);
router.post('/', upload.fields([{ name: 'colorVariantThumbnail', maxCount: 1 }, { name: 'images', maxCount: 6 }]), AdminProductController.addProduct);
router.put('/addcolorandsizes', upload.fields([{ name: 'colorVariantThumbnail', maxCount: 1 }, { name: 'images', maxCount: 6 }]), AdminProductController.addColorAndItsSizeVariant);
router.put('/product_info/:id', upload.none(), AdminProductController.updateProductInfo);
router.post('/add_size/:id', upload.none(), AdminProductController.addSizeVariant);
router.put('/update_size/:id', upload.none(), AdminProductController.update_size_variant);
router.put('/update_thumbnail/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), AdminProductController.update_thumbnail_image);
router.put('/update_image/:id', upload.fields([{ name: 'image', maxCount: 1 }]), AdminProductController.update_color_variant_image);
router.post('/add_image/:id', upload.fields([{ name: 'image', maxCount: 1 }]), AdminProductController.add_color_variant_image);
router.delete('/:id', AdminProductController.deleteProduct);
router.get('/category/:id', AdminProductController.getProductsByCategoryId);
router.put('/updateSizeVariant/:productId /:colorVariantId/:sizeVariantId', upload.none(), AdminProductController.updateSizeVariantByID);
router.put('/updateColorVariant/:productId/:colorVariantId', upload.none(), AdminProductController.updateColorVariantByID);

module.exports = router;