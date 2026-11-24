
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    contact: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    refreshTokenHash: {
        type: String,
        default: null
    },
    
    resetPasswordTokenHash: {
    type: String,
    default: null
},

resetPasswordExpires: {
    type: Date,
    default: null
}

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
