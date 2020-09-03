const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

/*
* SOCKET.IO INITIALIZATION
*/
const app = express();
const server = http.createServer(app);
const io = socketio(server, { path:"/", cookie: false });

/*
* CUSTOM IMPORTS
*/
// require('dotenv').config()
// const { mongoose } = require("./db/mongoose");

const { generateMessage } = require('./utils');
const {addUser, removeUser,getUser, getUsersInRoom, getRoomMessages} = require('./utils/users');



/*
* MONGOOSE
*/
const PORT = process.env.PORT || 1337;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDirectoryPath));

app.get('/', (req,res)=>{
    res.send('Netflix Party plus server')
})


/*
* SOCKET LOGIC
*/
io.on('connection', async (socket)=>{ 

    socket.on('join', async ({name, room}, callback) =>{
        // const {error, user} = await addUser({
        //     id: socket.id,
        //     name,
        //     room
        // });

        // if(error){
        //     return callback(error);
        // }

        // socket.join(user.room);
        socket.join(room);


        // socket.emit('message', await generateMessage('Admin', `Welcome!`, {
        //     type: 'event', 
        //     roomId: user.room,
        //     socketId: socket.id
        // }));

        // socket.broadcast.to(user.room).emit('message', await generateMessage('Admin', `${user.name} has joined!`,{
        //     type: 'event', 
        //     roomId: user.room,
        //     socketId: socket.id
        // }));

        callback();
    });


    // socket.on('sendMessage', async ({body, name}, callback) => {
    //     const user = await getUser(name);
    //     io.to(user.roomId).emit('message', await generateMessage(user.name, body, {
    //         type: 'message', 
    //         roomId: user.roomId,
    //         socketId: socket.id
    //     }));
    //     callback();
    // });

    // socket.on('getRoomMessages', async ({roomId}, callback) => {
    //     const messages = await getRoomMessages(roomId);
    //     callback(messages);
    // });


    // socket.on('disconnect', async () => {
    //     const user = await getUser(socket.id);

    //     socket.emit('user-disconnected');

    //     if(user){
    //         io.to(user.roomId).emit('message', await generateMessage('Admin',`${user.name} has left!`,{
    //             type: 'event', 
    //             roomId: user.roomId,
    //             socketId: socket.id
    //         }));
    //     }
    // });

    socket.on('pause', async ({name, room}) => {
        // const user = await getUser(name);

            socket.to(room).emit('paused', `Video paused by ${name}`);
    })

 
});


/*
* LISTEN TO PORT
*/
server.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})
