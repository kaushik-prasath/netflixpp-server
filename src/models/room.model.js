const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const RoomSchema = new Schema({
    room: {
        type: String,
    },
    messages: {
        type: Array
    },
    createdAt: {
        type: Number,
        default: Date.now,
    },
    users: [
        {
            type: Schema.ObjectId,
            ref: "user"
        }
    ],
    active: {
        type: Boolean,
        default: true
    }
});

let Room = mongoose.model('room', RoomSchema);
module.exports = Room; 