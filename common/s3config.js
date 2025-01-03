const config = require('../config')
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const awsConfig = {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    endpoint: config.aws.endpoint,
    signatureVersion: config.aws.signatureVersion,
}

AWS.config.update({ region: config.aws.regionName });

const s3 = new AWS.S3(awsConfig);

module.exports = {
    s3
}