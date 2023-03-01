const { response } = require("express");
const Users = require("../models/Users");
const errorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const { recoverPersonalSignature } = require("eth-sig-util");
const { bufferToHex, Address } = require("ethereumjs-util");

var pattern =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.register = async (request, response, next) => {
  var { signature, nonce, publicAddress, username, email, password } =
    request.body;
  console.log("the signature is ", publicAddress);

  try {
    const msg = `Alpha-Baetrum Onboarding unique one-time nonce: ${nonce} by signimg this you are verifying your ownership of this wallet`;
    // console.log("the nonce is ". 1111);

    // We now are in possession of msg, publicAddress and signature. We
    // will use a helper from eth-sig-util to extract the address from the signature
    const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature.signature,
    });
    console.log("the address is", msg);

    // The signature verification is successful if the address found with
    // sigUtil.recoverPersonalSignature matches the initial publicAddress
    // console.log("the address is",publicAddress);
    if (address.toLowerCase() === publicAddress.toLowerCase()) {
      const user = await Users.create({
        nonce,
        publicAddress,
        username,
        email,
        password,
      });

      user.nonce = Math.floor(Math.random() * 10000);
      user.save();
      sendToken(user, 200, response);
    } else {
      res.status(401).send({
        error: "Signature verification failed",
      });
      s;

      // return null;
    }
  } catch (err) {
    next(err.subject);
  }
};

exports.login = async (request, response, next) => {
  const { signature, nonce, publicAddress, email, password } = request.body;
  console.log("my nonnnceee is", nonce);

  const user = await Users.findOne({ email }).select("+password");
  if (!email || !password) {
    return next(
      new errorResponse("Please provide an email and password", 400, 3)
    );
  }

  try {
    const msg = `Alpha-Baetrum Onboarding unique one-time nonce: ${nonce} by signimg this you are verifying your ownership of this wallet`;
    // console.log("the nonce is ". 1111);

    // We now are in possession of msg, publicAddress and signature. We
    // will use a helper from eth-sig-util to extract the address from the signature
    const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature.signature,
    });
    console.log("the address is", msg);

    // The signature verification is successful if the address found with
    // sigUtil.recoverPersonalSignature matches the initial publicAddress
    // console.log("the address is",publicAddress);
    if (address.toLowerCase() === publicAddress.toLowerCase()) {
      sendToken(user, 200, response);
    } else {
      res.status(401).send({
        error: "Signature verification failed",
      });

      // return null;
    }
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (request, response, next) => {
  const { email } = request.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return next(new errorResponse("Email could not be synced"), 404, 6);
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

    const message = `

            <h1>You have requested a new password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password reset request",
        text: message,
      });

      response.status(200).json({
        success: true,
        data: "Email sent",
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new errorResponse("Email could not be synced", 500, 7));
    }
  } catch (err) {
    return next(err);
  }
};

exports.resetPassword = async (request, response, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(request.params.resetToken)
    .digest("hex");

  console.log(resetPasswordToken);
  try {
    const user = await Users.findOne({
      resetPasswordToken,
      // resetPasswordExpire: { $gt: Date.now() }
    });

    console.log(user);
    if (!user) {
      return next(new ErrorResponse("invalid reset token", 400, 8));
    }

    user.password = request.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return response.status(201).json({
      success: true,
      data: "password reset successful",
    });
  } catch (err) {
    next(err);
  }
};

const sendToken = (user, statusCode, response) => {
  const token = user.getSignedToken();
  response.status(statusCode).json({
    success: true,
    token,
  });
};
