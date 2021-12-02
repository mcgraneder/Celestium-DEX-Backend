const { response } = require("express");
const User = require("../models/Users");
const errorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");

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

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

        const message = `

            <h1>You have requested a new password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `

        try {

            await sendEmail({

                to: user.email,
                subject: "Password reset request",
                text: message
            });

            response.status(200).json({
                success: true,
                data: "Email sent"
            })


        } catch (err) {

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return next(new errorResponse("Email could not be synced", 500));

        }

    } catch (err) {

        return next(err)

    }
}

exports.resetPassword = async (request, response, next) => {

    const resetPasswordToken = crypto.createHash("sha256").update(request.params.resetToken).digest("hex");

    console.log(resetPasswordToken)
    try {

        const user = await User.findOne({

            resetPasswordToken,
            // resetPasswordExpire: { $gt: Date.now() }
        })

        console.log(user);
        if (!user) {

            return next(new ErrorResponse("invalid reset token", 400));
        }

        user.password = request.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return response.status(201).json({

            success: true,
            data: "password reset successful"
        })

    } catch (err) {

        next(err)

    }
};

const sendToken = (user, statusCode, response) => {

    const token = user.getSignedToken();
    response.status(statusCode).json({ 
        success: true,
        token
    })
}





