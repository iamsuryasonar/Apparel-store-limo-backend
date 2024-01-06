const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
// Middleware to authenticate Admin and Customer based on their role
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log('token', token);

    try {
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(decodedToken)

        if (decodedToken.role === 'ADMIN') {
            // If role is admin, find the admin by id
            const admin = await Admin.findById(decodedToken._id);
            if (!admin) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            req.user = admin; // Set the user object on the request
        } else if (decodedToken.role === 'CUSTOMER') {
            // If role is customer, find the customer by id
            const customer = await Customer.findById(decodedToken.id);
            if (!customer) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            req.user = customer; // Set the user object on the request
        } else {
            return res.status(401).json({ message: 'Invalid token' });
        }

        next(); // Call the next middleware or route handler
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Invalid token' });
    }
};



function restrictTo(role) {
    return (req, res, next) => {
        if (req.user.role === role) {
            // User is authorized to access the route, call the next middleware function
            next();
        } else {
            // User is not authorized, send a 403 Forbidden response
            res.status(403).send('You are not authorized to access this route');
        }
    };
}

module.exports = {
    restrictTo,
    authenticate
};