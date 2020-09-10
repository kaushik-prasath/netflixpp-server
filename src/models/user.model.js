const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
    },
    room: {
        type: String,
        trim: true,
    },
    socketId: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Number,
        default: Date.now,
    },
    messages: {
        type:Array
    },
    active:{
        type: Boolean
    },
    admin: {
        type: Boolean
    }
});

let User = mongoose.model('user', UserSchema);
module.exports = User; 