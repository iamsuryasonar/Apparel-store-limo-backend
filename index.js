const express = require('express')
const mongoose = require('mongoose')
const Joi = require('joi')
let cors = require('cors')
let multer = require('multer')
const bodyParser = require('body-parser');
require('dotenv').config();
let app = express();
app.use(cors())


const authMiddleware = require('./middlewares/authMiddleware');

const { admin_auth_route, admin_product_route, admin_category_route } = require('./routes/admin_routes');
const { customer_auth_route, customer_product_route, cart_route, order_route } = require('./routes/customer_routes');


// app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

// Mongoose options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
mongoose.set("strictQuery", false);
// Connect to the MongoDB server
mongoose.connect(process.env.DB_CONNECT, mongooseOptions)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });

// Create a reference to the connection
const db = mongoose.connection;

// Event listeners for connection events
db.on('error', error => {
    console.error('MongoDB connection error:', error);
});
db.once('open', (error) => {
    console.log('MongoDB connection established', error);
});
db.on('disconnected', (error) => {
    console.log('MongoDB disconnected', error);
});


//! Auth routes--------------------------------------->
app.use('/admin/api/v1/auth', admin_auth_route);
app.use('/api/v1/auth', customer_auth_route);

//! Admin routes-------------------------------------->
app.use('/admin/api/v1/product', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), admin_product_route);
app.use('/admin/api/v1/category', authMiddleware.authenticate, authMiddleware.restrictTo('ADMIN'), admin_category_route);

//! Customer routes----------------------------------->
app.use('/api/v1/product', customer_product_route);
app.use('/api/v1/cart', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), cart_route);
app.use('/api/v1/order', authMiddleware.authenticate, authMiddleware.restrictTo('CUSTOMER'), order_route);

app.get("/", function (request, response) {
    response.send("Hello World!");
})

app.listen(process.env.PORT, function () {
    console.log("Started application on port %d", process.env.PORT);
});