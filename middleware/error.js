const errorResponse = require("../utils/errorResponse");

const errorHandler = (err, request, response, next) => {

    let error = {...err};

    console.log(err);

    error.message = err.message;

    if (err.code === 1100) {

        const message = `Duplicate field value enetered`;
        error = new errorResponse(message, 400);
    }

    if (error.name === `ValidationError`) {

        const message = Object.values(err.errors).map((value) => value.message);
        error = new errorResponse(message, 400);
    }

    response.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error"
    })
}

module.exports = errorHandler;