const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB connected successfully");
    }
    catch (error) {
        console.error("Mongo db connection failed");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;