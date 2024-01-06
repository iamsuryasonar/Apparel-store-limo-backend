const AuthController = require('./auth_controllers/AdminAuthController');
const CustomerAuthController = require('./auth_controllers/CustomerAuthController');
const AdminProductController = require('./admin_controllers/AdminProductController');
const CustomerProductController = require('./customer_controllers/CustomerProductController');
const CategoryController = require('./admin_controllers/CategoryController')
module.exports = {
    AuthController,
    CustomerAuthController,
    AdminProductController,
    CustomerProductController,
    CategoryController,
}