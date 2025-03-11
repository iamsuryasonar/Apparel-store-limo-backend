const express = require('express');
const router = express.Router();
const { ReviewController } = require('../controllers');
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), ReviewController.addReview);
router.put('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), ReviewController.updateReview);
router.delete('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), ReviewController.deleteReview);

module.exports = router;