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

exports.forgotPassword = async (request, response, next) => {

    const { email } = request.body;

    try {

        const user = await User.findOne({ email });

        if (!user) {

            return next(new errorResponse("Email could not be synced"), 404);

        } 

        const requestToken = user.resetPasswordToken();
        await user.save();

        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

        const message = `

            <h1>You have requested a new password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `

        try {

            

        } catch (err) {


        }

    } catch (err) {


    }
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





