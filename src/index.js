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
require('dotenv').config()
const { mongoose } = require("./db/mongoose");

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

    socket.on('join', async ({name, room, admin}, callback) => {
        const {error, user} = await addUser({
            id: socket.id,
            name,
            room,
            admin
        });

        if(error){
            return callback(error);
        }

        socket.join(user.room);
        // socket.join(room);

       if(user.admin){
        let clientIds = Object.keys( io.of('/').connected );
<<<<<<< HEAD
=======
        console.log('clientIds', clientIds);
>>>>>>> 57c5b6e8394999c8d03e8399d0323b511b15bbff
        clientIds.unshift(user.socketId);
        clientIds.pop();
        console.log('clientIds', clientIds);
        io.sockets.in(clientIds[0]).emit('getCurrentPlaybackTime'); 
       }
        

        socket.on('sendCurrentPlaybackPosition', (playbackPosition) =>{
            socket.broadcast.to(user.room).emit('playbackposition', playbackPosition);
        });


        socket.on('scrubber-move', async (currentPositionText) => {
            let clientIds = Object.keys( io.of('/').connected );

            if(socket.id === clientIds[0]){
                const user = await getUser(name);
                io.emit('message', await generateMessage(`${user.name}(Admin)`, `Jumped to ${currentPositionText}`,{
                    socketId: user.socketId,
                    room: user.room,
                    type: 'event'
                }));
            }
            io.sockets.in(clientIds[0]).emit('getCurrentPlaybackTime');
    
            socket.on('sendCurrentPlaybackPosition', (playbackPosition) =>{
                socket.broadcast.to(user.room).emit('playbackposition', playbackPosition);
            });
        });
    
       

        socket.emit('message', await generateMessage('', `Welcome ${name}!`,{
            socketId: user.socketId,
            room: user.room,
            type: 'event'
        }));

        socket.on('sendMessage', async ({body, name}, callback) => {
            console.log(body, name);
            const user = await getUser(name);
            io.to(user.room).emit('message', await generateMessage(user.name, body, {
                socketId: user.socketId,
                room: user.room,
                type: 'message'
            }));
            callback();
        });


        socket.on('pause', async ({name, room}) => {
                const user = await getUser(name);
    
                socket.to(user.room).emit('paused');
                io.to(user.room).emit('message', await generateMessage(user.name, 'Paused the video', {
                    socketId: user.socketId,
                    room: user.room,
                    type: 'event'
                }));
        })
    
    
        socket.on('play', async ({name, room}) => {
                const user = await getUser(name);
                socket.to(user.room).emit('played');

                io.to(user.room).emit('message', await generateMessage(user.name, 'Played the video', {
                    socketId: user.socketId,
                    room: user.room,
                    type: 'event'
                }));
        })

        socket.broadcast.to(user.room).emit('message', await generateMessage('', `${user.name} has joined!`, {
            socketId: user.socketId,
            room: user.room,
            type: 'event'
        }));


        socket.on('disconnect', async () => {
            const user = await getUser(socket.id);
    
            socket.emit('user-disconnected');
    
            if(user){
                io.to(user.room).emit('message', await generateMessage('',`${user.name} has left!`, {
                    socketId: user.socketId,
                    room: user.room,
                    type: 'event'
                }));
            }
        });


       
    

        callback();
    });

    socket.on('getRoomMessages', async ({room}, callback) => {
        console.log('room', room);
        const messages = await getRoomMessages(room);
        callback(messages);
    });

 
});


/*
* LISTEN TO PORT
*/
server.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})
