const { response } = require("express");
const User = require("../models/Users");
const errorResponse = require("../utils/errorResponse")

exports.register = async (request, response, next) => {

    const { username, email, password } = request.body;

    try {

        const user = await User.create({
            username, email, password
        })

        sendToken(user, 200, response);

    } catch (err) {

        next(err);
    }
    
}

exports.login = async (request, response, next) => {

    const { email, password } = request.body;
    console.log(email)

    if (!email || !password) {

        return next(new errorResponse("Please provide an email and password", 400));
    }

    try {

        const user = await User.findOne({ email }).select("+password");

        if (!user) {

        return next(new errorResponse("Invalid credentials", 401));
           
        }

        const isMatch = await user.matchPasswords(password);

        if(!isMatch) {

            return next(new errorResponse("Invalid credentials", 401));

        }

        sendToken(user, 201, response);

        
    } catch(err) {

        next(err);

    }
    
}

exports.forgotPassword = (request, response, next) => {

    response.send("ForgotPassword Route");
}

exports.resetPassword = (request, response, next) => {

    response.send("Reset password Route");
};

const sendToken = (user, statusCode, response) => {

    const token = user.getSignedToken();
    response.status(statusCode).json({ 
        success: true,
        token
    })
}





