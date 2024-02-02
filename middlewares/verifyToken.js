const jwt = require('jsonwebtoken')
const { error } = require('../responseAPI')
const verify = async (req, res, next) => {

    const token = req?.header('Authorization')?.slice(7);
    if (!token) return res.status(401).json(error("Access denied", res.statusCode));

    try {
        const verified = await jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    } catch (error) {
        return res.status(400).json(error("Invalid token", res.statusCode));
    }
}

module.exports.verify = verify