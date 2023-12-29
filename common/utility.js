
const responseHandler = (res, status_code, status, message, data) => {
    res.status(status_code).json({
        status_code,
        status,
        message,
        data,
    })
}



module.exports = {
    responseHandler,
};