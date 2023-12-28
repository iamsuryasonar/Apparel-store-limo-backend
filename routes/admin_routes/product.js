const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { AdminProductController } = require('../../controllers');

router.get('/', AdminProductController.getProductById);
router.get('/', AdminProductController.getAllProducts);
router.post('/add_product', upload.none(), AdminProductController.addProduct);
router.put('/:id', upload.none(), AdminProductController.updateProduct);
router.delete('/:id', AdminProductController.deleteProduct);

module.exports = router;