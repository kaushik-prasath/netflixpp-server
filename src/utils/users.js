const User = require('../models/user.model');
const Room = require('../models/room.model');


const addUser = async ({ id, name, room }) => {
   return new Promise(async (resolve, reject) => {
        // Clean the data
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

        // Validate the data
        if (!name || !room) {
            return {
                error: 'name and room are required!'
            }
        }

        try{

            let newUser = new User({
                socketId: id,
                roomId: room, 
                name
            });
    
           let savedUser = await newUser.save();

           let newRoom = new Room({
            roomId: room
           });
           newRoom.users.push(savedUser._id);
           await newRoom.save();
    
           const user = { id, name, room }
            resolve({
                user
            })
        }catch(e){
            console.log(e);
        }
       
   });
}

const removeUser = async (id) => {
    return new Promise(async (resolve, reject) => {
        let user = await User.findOne({socketId: id});

        resolve(user);
    })
}

const getUser = async (name) => {
    return new Promise( async (resolve, reject) => {
        name = name.trim().toLowerCase();
        let user = await User.findOne({name});
        resolve(user);
    });
    // return users.find((user) => user.id === id)
}

const getUsersInRoom = async (room) => {
    return new Promise(async (resolve, reject) => {
        room = room.trim().toLowerCase()

        let users = await User.find({room});
        resolve(users);
    })
}


const getRoomMessages = async (roomId) => {
    return new Promise(async (resolve, reject) => {
        roomId = roomId.toLowerCase();
        let room = await Room.findOne({roomId}).select('messages');
        resolve(room);
    });
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRoomMessages
}