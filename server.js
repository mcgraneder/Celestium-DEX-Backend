require("dotenv").config({path: "./config.env"})
const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const errorHanlder = require("./middleware/error");
const cors = require("cors")


//connect db
connectDB();

const app = express();
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));
app.use("/api/users", require("./routes/users"))
// app.use("/", require("./routes/users"))
app.use(errorHandler);
app.use(cors())
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`serving on port ${PORT}`))

// process.on("unhandledRejection", (err, promise) => {

//     console.log(`logged error ${err}`);
//     server.close(() => process.exit(1));
// })