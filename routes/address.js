const express = require('express');
const router = express.Router();
const { AddressController } = require('../controllers');
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), AddressController.getAllAddresses);
router.post('/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), AddressController.addAddress);
router.put('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), AddressController.updateAddress);
router.delete('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), AddressController.deleteAddress);

module.exports = router;