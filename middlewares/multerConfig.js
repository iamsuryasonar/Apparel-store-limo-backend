const multer = require('multer');

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

module.exports = {
    upload: upload,
};