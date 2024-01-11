const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const { error } = require('../responseAPI')
// Middleware to authenticate Admin and Customer based on their role
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json(error("Authorization header missing", res.statusCode));

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

        if (decodedToken.role === 'ADMIN') {
            // If role is admin, find the admin by id
            const admin = await Admin.findById(decodedToken._id);
            if (!admin) return res.status(401).json(error("Invalid token", res.statusCode));

            req.user = admin; // Set the user object on the request
        } else if (decodedToken.role === 'CUSTOMER') {
            // If role is customer, find the customer by id
            const customer = await Customer.findById(decodedToken.id);
            if (!customer) return res.status(401).json(error("Invalid token", res.statusCode));

            req.user = customer; // Set the user object on the request
        } else {
            return res.status(401).json(error("Invalid token", res.statusCode));
        }

        next(); // Call the next middleware or route handler
    } catch (error) {
        return res.status(401).json(error("Invalid token", res.statusCode));
    }
};



function restrictTo(role) {
    return (req, res, next) => {
        if (req.user.role === role) {
            // User is authorized to access the route, call the next middleware function
            next();
        } else {
            // User is not authorized, send a 403 Forbidden response
            return res.status(403).json(error("Not authorized to access", res.statusCode));
        }
    };
}

module.exports = {
    restrictTo,
    authenticate
};