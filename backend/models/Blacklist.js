const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // Automatically remove the token after 1 hour
    },
});

const Blacklist = mongoose.model("Blacklist", blacklistSchema);

module.exports = Blacklist;
