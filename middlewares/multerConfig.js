const multer = require('multer');

// Define multer storage and upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now(); // Get the current timestamp in milliseconds
        const extension = file.originalname.split('.').pop(); // Get the file extension
        const originalFilenameWithoutExtension = file.originalname
            .split('.')
            .slice(0, -1)
            .join('.'); // Remove the extension from the original filename
        const newFilename = `${originalFilenameWithoutExtension}_${timestamp}.${extension}`; // Combine original name, timestamp, and extension
        cb(null, newFilename);
    }
});

const upload = multer({ storage: storage });

module.exports = {
    upload,
};