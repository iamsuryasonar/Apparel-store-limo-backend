const jwt = require('jsonwebtoken');
const config = require('../config')

const generateToken = (data) => {
    return jwt.sign({ _id: data._id, role: data.role, exp: Math.floor(Date.now() / 1000) + 24 * 3600, }, config.jwt.tokenSecret,)
};

exports.generateToken = generateToken;