require('dotenv').config();
const express = require("express")
const cors = require('cors');
const { Sequelize } = require('sequelize');

let app = express();



const authMiddleware = require('./middlewares/authMiddleware');

const { admin_auth_route, admin_product_route } = require('./routes/admin_routes');
const { customer_auth_route, customer_product_route } = require('./routes/customer_routes');


// app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());


const db = require("./models");

//Check db connection status
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection successful.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
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
    console.log(process.env.PORT)
    console.log("Started application on port %d", process.env.PORT)
});