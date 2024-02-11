const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const { error } = require('../common/responseAPI')
const config = require('../config')
const {verifyToken} = require('../utils/verifyToken');

// Middleware to authenticate Admin and Customer based on their role
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json(error("Authorization header missing", res.statusCode));

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = verifyToken(token);
        if (decodedToken.role === 'ADMIN') {
            // If role is admin, find the admin by id
            const admin = await Admin.findById(decodedToken._id);
            if (!admin) return res.status(401).json(error("Invalid token", res.statusCode));

            req.user = {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            };

        } else if (decodedToken.role === 'CUSTOMER') {
            // If role is customer, find the customer by id
            const customer = await Customer.findById(decodedToken._id);
            if (!customer) return res.status(401).json(error("Invalid token", res.statusCode));

            req.user = {
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                role: customer.role,
            };

        } else {
            return res.status(401).json(error("Invalid token", res.statusCode));
        }

        next();
    } catch (err) {
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};



function restrictTo(role) {
    return (req, res, next) => {
        if (req.user.role === role) {
            next();
        } else {
            return res.status(403).json(error("Not authorized to access", res.statusCode));
        }
    };
}

module.exports = {
    restrictTo,
    authenticate
};