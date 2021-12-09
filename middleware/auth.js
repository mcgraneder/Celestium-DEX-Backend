const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const errorResponse = require("../utils/errorResponse");

exports.protect = async(request, response, next) => {

    let token;

    if(request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {

        token = request.headers.authorization.split(" ")[1]
    }

    if (!token) {

        return next(new errorResponse("not authorized to access this route", 401, 9));
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {

            return next(new errorResponse("No user found with this ID", 404, 10));
        }

        request.user = user;

        next();

    } catch (err) {

        return next(new errorResponse("not authorized to access this route", 401, 11));
    }
}