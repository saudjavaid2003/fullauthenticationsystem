class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errormiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 400;

    if (err.name === "CastError") {
        err.message = `Invalid ${err.path}`;
        err.statusCode = 400;
    }

    if (err.name === "JsonWebTokenError") {
        err.message = "Invalid token";
        err.statusCode = 400;
    } 

    if (err.name === "TokenExpiredError") {
        err.message = "Token has expired";
        err.statusCode = 400;
    }

    if (err.code === 11000) {
        err.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err.statusCode = 400;
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
