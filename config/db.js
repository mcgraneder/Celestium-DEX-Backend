const mongoose = require("mongoose");

const connectDB = async() => {

    await mongoose.connect("mongodb+srv://mcgrane5:Emcg45245@alphabaetrum.guhbh.mongodb.net/node_auth?retryWrites=true&w=majority", {
        useNewUrlParser: true, 

        useUnifiedTopology: true
        
    });

    console.log("mongodb connected")
}

module.exports = connectDB;