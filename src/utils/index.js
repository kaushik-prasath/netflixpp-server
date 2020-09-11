const User = require('../models/user.model');
const Room = require('../models/room.model');

const generateMessage = async (name,text, options) => {
    return new Promise(async (resolve, reject) =>{
        const {type, room, socketId} = options;

        let message = {
            type,
            text,
            name,
            createdAt: Date.now
        }

        if(type !== 'event'){
            await User.findOneAndUpdate({name}, {$addToSet: {messages: message}});
        }

        await Room.findOneAndUpdate({room}, {$addToSet: {messages: message}});

        resolve({
            name,
            text,
            createdAt: new Date().getTime()
        }) 
    })
}

module.exports = {
    generateMessage
}