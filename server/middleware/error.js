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
        const message = `Invalid ${err.path}`;
        err = new CustomError(message, 400);
    }

    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token";
        err = new CustomError(message, 400);
    } 

    if (err.name === "TokenExpiredError") {
        const message = "Token has expired";
        err = new CustomError(message, 400);
    }

    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new CustomError(message, 400);
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
