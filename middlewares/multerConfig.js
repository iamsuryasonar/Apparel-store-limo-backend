const multer = require('multer');
const crypto = require('crypto');

const { s3 } = require('../common/s3config');

let upload = multer({
    limits: 1024 * 1024 * 5,
    fileFilter: function (req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp') {
            next(null, true)
        } else {
            next('milter error -file type is not supported', false)
        }
    }
})

let uploadTos3 = (fileData) => {
    return new Promise((resolve, reject) => {
        const uuid = crypto.randomBytes(6).toString("hex");
        const fileName = `${uuid}_${Date.now().toString()}.webp`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileData,
            ContentType: "image/webp"
        }

        const request = s3.putObject(params);

        request.on('httpHeaders', (statusCode, headers) => {
            console.log('status code ', statusCode);
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
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path,
    };

    await s3.deleteObject(deleteParams).promise();
};

module.exports = {
    upload: upload,
    uploadTos3: uploadTos3,
    deleteS3Object: deleteS3Object,
};