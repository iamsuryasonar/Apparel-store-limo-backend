const Joi = require('joi')

const registerValidation = (data) => {
    // object for validation using Joi
    const schema = Joi.object({
        name: Joi.string().min(4).max(255).required(),
        email: Joi.string().min(6).max(255).email().required(),
        password: Joi.string().min(8).max(500).required(),
    })
    return schema.validate(data)
}


const loginValidation = (data) => {
    // object for validation using Joi
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).email().required(),
        password: Joi.string().min(6).max(500).required(),
    })
    return schema.validate(data)
}

module.exports.registerValidation = registerValidation

module.exports.loginValidation = loginValidation