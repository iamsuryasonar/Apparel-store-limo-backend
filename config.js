require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3001,
    mongo: {
        uri: process.env.DB_CONNECT,
    },
    jwt: {
        tokenSecret: process.env.TOKEN_SECRET,
    },
    aws: {
        endpoint: process.env.ENDPOINT,
        signatureVersion: process.env.SIGNATUREVERSION,
        accessKeyId: process.env.AWS_ACCESS_ID,
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
        bucketName: process.env.AWS_BUCKET_NAME,
        regionName: process.env.AWS_REGION_NAME,
    },
    razorpay: {
        key: process.env.RZR_KEY,
        secret: process.env.RZR_SECRET,
    },
    resend: {
        key: process.env.RESEND_KEY,
    }
};