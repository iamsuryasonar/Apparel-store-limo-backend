const multer = require('multer');
// const crypto = require("crypto");

// const storage = multer.diskStorage({
//     destination: function async(req, file, cb) {
//         const webpImageBuffer = sharp(file.buffer)
//             .webp({ quality: 10 })
//             .toBuffer();
//         file = webpImageBuffer;
//         cb(null, './uploads');
//     },
//     filename: function (req, file, cb) {
//         const uuid = crypto.randomBytes(6).toString("hex");
//         const timestamp = Date.now();
//         const extension = file.originalname.split('.').pop();
//         const originalFilenameWithoutExtension = file.originalname
//             .split('.')
//             .slice(0, -1)
//             .join('.'); 
//         const newFilename = `${originalFilenameWithoutExtension}_${uuid}_${timestamp}.${extension}`; // Combine original name, timestamp, and extension
//         cb(null, newFilename);
//     }
// });
// const upload = multer({ storage:storage });
const upload = multer({ storage: multer.memoryStorage() });


module.exports = {
    upload: upload,
};