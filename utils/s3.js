const crypto = require('crypto');
const config = require('../config')
const { s3 } = require('../common/s3config');

let uploadTos3 = (fileData) => {
    return new Promise((resolve, reject) => {
        const uuid = crypto.randomBytes(6).toString("hex");
        const fileName = `${uuid}_${Date.now().toString()}.webp`;

        const params = {
            Bucket: config.aws.bucketName,
            Key: fileName,
            Body: fileData,
            ContentType: "image/webp"
        }

        const request = s3.putObject(params);

        request.on('httpHeaders', (statusCode, headers) => {
            resolve({
                url: `https://ipfs.filebase.io/ipfs/${headers['x-amz-meta-cid']}`,
                fileName: fileName
            })
        });

        request.on('httpError', (error, response) => {
            reject(error)
        });

        request.send();
    })
}

const deleteS3Object = async (path) => {

    const deleteParams = {
        Bucket: config.aws.bucketName,
        Key: path,
    };

    await s3.deleteObject(deleteParams).promise();
};

module.exports = {
    uploadTos3: uploadTos3,
    deleteS3Object: deleteS3Object,
};