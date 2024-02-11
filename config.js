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
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_ACCESS_KEY_SECRET,
        bucketName: process.env.AWS_BUCKET_NAME,
        regionName: process.env.AWS_REGION_NAME,
    }
};