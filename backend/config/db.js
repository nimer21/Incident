const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {//MONGODB_URI | MONGO_CLOUD_URI
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected ^_^');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;