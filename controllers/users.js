const User = require("../models/Users")
const { response } = require("express");
const errorResponse = require("../utils/errorResponse");
const ErrorResponse = require("../utils/errorResponse");
const { recoverPersonalSignature } = require("eth-sig-util");
const  { bufferToHex, Address } = require("ethereumjs-util");


exports.getUserData = async (request, response, next) => {

    // response.status(200).json({
    //     success: true,
    //     data: "you got access to the private data in this route"
    // })
    await User.find({}).then((data) => {

        console.log("Data", data)
        response.send(data)
    })
}

exports.FindAddress = async (request, response, next) => {

    // response.status(200).json({
    //     success: true,
    //     data: "you got access to the private data in this route"
    // })
    var { publicAddress, username, email, password } = request.body;
    console.log(publicAddress)
    publicAddress = publicAddress.toLowerCase()
    const found = await User.findOne({ publicAddress });
    console.log(found)
    if (found) {

        return next(new errorResponse("Wallet Already registered", 400, 1));
    }

    if (username === "") {

        return next(new errorResponse("You need to provide a username", 400, 1));

    }

    if (email === "") {

        return next(new errorResponse("You need to provide a Email", 400, 1));

    }

    if (password.length < 6) {

        return next(new errorResponse("Password needs to be 6 characters", 400, 1));
    }

    const user1 = await User.findOne({ username });

    if (user1) {

        return next(new errorResponse("Username already taken", 401, 2));
    }

    const user2 = await User.findOne({ email });

    if (user2) {

        return next(new errorResponse("Email already registered", 401, 2));
    }

    response.status(200).json({ 
        success: true
    })

}

exports.getUserNonce = async (request, response, next) => {

    // response.status(200).json({
    //     success: true,
    //     data: "you got access to the private data in this route"
    // })
    var { publicAddress, email, password } = request.body;
    
    publicAddress = publicAddress.toLowerCase()
    const found = await User.findOne({ publicAddress });

    console.log("adddddd", found)
    
    if (!found) {

        return next(new errorResponse("Wallet address not registered. Please Sign Up", 400, 1));
    }

    const user = await User.findOne({ email }).select("+password");

        if (!user) {

        return next(new errorResponse("Invalid credentials", 401, 4));
           
        }

        const isMatch = await user.matchPasswords(password);

        if(!isMatch) {

            return next(new errorResponse("Invalid credentials", 401, 5));

        }

        const user4 = await User.findOne({ publicAddress });

        console.log("user 3 is", user4)
       
        if (!user4) {

            return next(new errorResponse("This wallet is not registered", 401, 2));
        }

    const nonce = found.nonce;


    response.status(200).json({ 
        success: true,
        nonce: nonce
    })
}

exports.getUser = async (request, response, next) => {

    // response.status(200).json({
    //     success: true,
    //     data: "you got access to the private data in this route"
    // })
    var { publicAddress } = request.body;
    
    // publicAddress = publicAddress.toLowerCase()
    const found = await User.findOne({ publicAddress});

    console.log("adddddd", found.publicAddress, publicAddress)
    
    if (found == null || undefined) {

        response.status(200).json({ 
            success: false,
            address: ""
           
        })

    }


    response.status(200).json({ 
        success: true,
        address: publicAddress
       
    })
}

exports.getUserAddress = async (request, response, next) => {

    var { publicAddress } = request.body;
    
    publicAddress = publicAddress.toLowerCase()
    await User.findOne({publicAddress}).then((data, err) => {

        if (data == null) {

            console.log("err")
            return next(new errorResponse("Wallet Address not registered", 401, 2));
        }
        console.log("Data", data)
        response.status(200).json({ 
            success: true,
            address: publicAddress,
            email: data.email
           
        })
    })
}

exports.updateUserAddress = async(request, response, next) => {

    var { signature, nonce, publicAddress, email } = request.body;

    // var email = "mcgrane480@gmail.com"
    // var publicAddress = "0x3330e78dD15784e0DEc11146b5238F8C21043fea"
    publicAddress = publicAddress.toLowerCase()
    const user = await User.findOne({ email });
    console.log(user)
    try {

        const msg = `Alpha-Baetrum Onboarding unique one-time nonce: ${nonce} by signimg this you are verifying your ownership of this wallet`;
		const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
		const address = recoverPersonalSignature({data: msgBufferHex, sig: signature.signature});
        console.log("the address is", msg);

		if (address.toLowerCase() === publicAddress.toLowerCase()) {


            user.nonce =Math.floor(Math.random() * 10000);
            user.publicAddress.push(publicAddress);
            user.save();

            console.log(user);

            response.status(200).json({ 
                success: true,
                address: publicAddress
       
            })
            
		} else {
			res.status(401).send({
				error: 'Signature verification failed',
			});

			// return null;
		}

    } catch (err) {

        next(err.subject);
    }
}

exports.getNonce = async (request, response, next) => {

    const { email } = request.body;

    await User.findOne({email}).then((data) => {

        console.log("Data", data)
        response.status(200).json({ 
            success: true,
            nonce: data.nonce
   
        })
    })
}