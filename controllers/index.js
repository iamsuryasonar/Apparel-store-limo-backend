const AuthController = require('./auth_controllers/AdminAuthController');
const CustomerAuthController = require('./auth_controllers/CustomerAuthController');
const AdminProductController = require('./admin_controllers/AdminProductController');
const CustomerProductController = require('./customer_controllers/CustomerProductController');
const AdminCategoryController = require('./admin_controllers/AdminCategoryController')
const CartController = require('./customer_controllers/CartController');
const OrderController = require('./customer_controllers/OrderController');
const AdminOrderController = require('./admin_controllers/AdminOrderController');
const CategoryController = require('./customer_controllers/CategoryController');

module.exports = {
    AuthController,
    CustomerAuthController,
    AdminProductController,
    CustomerProductController,
    AdminCategoryController,
    CartController,
    OrderController,
    AdminOrderController,
    CategoryController
}