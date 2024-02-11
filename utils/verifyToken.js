const jwt = require('jsonwebtoken');
const config = require('../config')

const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.tokenSecret);
};

exports.verifyToken = verifyToken;