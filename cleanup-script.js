const mongoose = require('mongoose');

// Close Mongoose connection
mongoose.connection.close(() => {
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
});