const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
let cors = require('cors')
require('dotenv').config();
const https = require('https');
const config = require('./config')
let app = express();
app.use(cors())

const { auth_route, product_route, cart_route, order_route, category_route, address_route, payment_route, analytics_route, contact_us_route } = require('./routes');

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

// Mongoose options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000,
};
mongoose.set("strictQuery", false);
// Connect to the MongoDB server
mongoose.connect(config.mongo.uri, mongooseOptions)
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
db.once('open', (_) => {
    console.log('MongoDB connection established');
});
db.on('disconnected', (error) => {
    console.log('MongoDB disconnected', error);
});

app.use('/api/v1/auth', auth_route);
app.use('/api/v1/cart', cart_route);
app.use('/api/v1/order', order_route);
app.use('/api/v1/product', product_route);
app.use('/api/v1/category', category_route);
app.use('/api/v1/address', address_route);
app.use('/api/v1/payment', payment_route);
app.use('/api/v1/analytics', analytics_route);
app.use('/api/v1/contact-us', contact_us_route);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(config.port, function () {
    console.log("Started application on port %d", config.port);
    // this setInterval makes sure that the server don't spin down on idle.
    // reference - https://docs.render.com/free#spinning-down-on-idle
    // setInterval(() => {
    //     https.get('https://apparel-store-limo-backend.onrender.com/', (res) => {
    //         console.log(res.statusCode)
    //     })
    // }, 14 * 60 * 1000)
});
