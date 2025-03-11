const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
let cors = require('cors')
require('dotenv').config();
const config = require('./config');
const cluster = require('node:cluster');
const numOfCPU = require('node:os').availableParallelism();

let app = express();

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://admin-limo.netlify.app');
//     next();
// });

const {
    auth_route,
    product_route,
    cart_route,
    order_route,
    category_route,
    address_route,
    payment_route,
    analytics_route,
    contact_us_route,
    review_route,
} = require('./routes');

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
app.use('/api/v1/review', review_route);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
    console.log(`Primary ${process.pid} is running`)

    for (let i = 0; i < numOfCPU; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    app.listen(config.port, function () {
        console.log("Started application on port %d", config.port);
    });
}

module.exports = app;
