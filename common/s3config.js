const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
    endpoint: process.env.ENDPOINT,
    signatureVersion: process.env.SIGNATUREVERSION,
}

const s3 = new AWS.S3(awsConfig);

module.exports = {
    s3
}