const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Joi = require('joi')
let cors = require('cors')
let multer = require('multer')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
let app = express();

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.use(cors())

const authMiddleware = require('./middlewares/authMiddleware');

const { admin_auth_route, admin_product_route } = require('./routes/admin_routes');
const { customer_auth_route, customer_product_route } = require('./routes/customer_routes');


// app.use(express.urlencoded({ extended: false }));
app.use(express.json());


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

//! Customer routes----------------------------------->
app.use('/api/v1/product', customer_product_route);

app.get("/", function (request, response) {
    response.send("Hello World!")
})

app.listen(process.env.PORT, function () {
    console.log("Started application on port %d", process.env.PORT)
});