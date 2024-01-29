const AuthController = require('./auth_controllers/AdminAuthController');
const CustomerAuthController = require('./auth_controllers/CustomerAuthController');
const AdminProductController = require('./admin_controllers/AdminProductController');
const CustomerProductController = require('./customer_controllers/CustomerProductController');
const CategoryController = require('./admin_controllers/CategoryController')
const CartController = require('./customer_controllers/CartController');
const OrderController = require('./customer_controllers/OrderController');
const AdminOrderController = require('./admin_controllers/AdminOrderController');


module.exports = {
    AuthController,
    CustomerAuthController,
    AdminProductController,
    CustomerProductController,
    CategoryController,
    CartController,
    OrderController,
    AdminOrderController
}