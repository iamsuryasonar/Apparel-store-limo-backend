const auth_route = require('./auth');
const product_route = require('./product');
const cart_route = require('./cart');
const order_route = require('./order');
const category_route = require('./category');
const address_route = require('./address');
const payment_route = require('./payment');
const analytics_route = require('./analytics');

module.exports = {
    auth_route,
    product_route,
    cart_route,
    order_route,
    category_route,
    address_route,
    payment_route,
    analytics_route
};