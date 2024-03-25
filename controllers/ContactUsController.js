const { success, error } = require('../common/responseAPI')
const { Resend } = require('resend');
const config = require('../config')

// @desc   send Email
// @route   POST /api/v1/contact-us/
// @access  Customer/Public

exports.sendEmail = async (req, res) => {
    try {
        let { name, email, message, query } = req.body;
        /* body needs to be sanitized */
        const resend = new Resend(config.resend.key);
        resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'iamsuryasonar@gmail.com',
            subject: query,
            html: `<p> Name: <br> ${name} <br> Email: <br> ${email} <br> Message: <br> ${message}}</p>`
        });
        res.status(200).json(success("OK", {},
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};
