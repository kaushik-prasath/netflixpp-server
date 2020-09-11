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

const { generateMessage } = require('./utils/old');
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
        console.log('clientIds', clientIds);
        clientIds.unshift(user.socketId);
        clientIds.pop();
        io.sockets.in(clientIds[0]).emit('getCurrentPlaybackTime'); 
       }
        

        socket.on('sendCurrentPlaybackPosition', (playbackPosition) =>{
            socket.broadcast.to(user.room).emit('playbackposition', playbackPosition);
        });


        socket.on('scrubber-move', async (currentPositionText) => {
            let clientIds = Object.keys( io.of('/').connected );

            if(socket.id === clientIds[0]){
                const user = await getUser(name);
                io.emit('message', generateMessage(`${user.name}(Admin)`, `Jumped to ${currentPositionText}`));
            }
            io.sockets.in(clientIds[0]).emit('getCurrentPlaybackTime');
    
            socket.on('sendCurrentPlaybackPosition', (playbackPosition) =>{
                socket.broadcast.to(user.room).emit('playbackposition', playbackPosition);
            });
        });
    
       

        socket.emit('message', generateMessage('', `Welcome ${name}!`));

        socket.on('sendMessage', async ({body, name}, callback) => {
            const user = await getUser(name);
            io.to(user.room).emit('message', generateMessage(user.name, body));
            callback();
        });


        socket.on('pause', async ({name, room}) => {
                const user = await getUser(name);
    
                socket.to(user.room).emit('paused');
                io.to(user.room).emit('message', generateMessage(user.name, 'Paused the video'));
        })
    
    
        socket.on('play', async ({name, room}) => {
                const user = await getUser(name);
                socket.to(user.room).emit('played');

                io.to(user.room).emit('message', generateMessage(user.name, 'Played the video'));
        })

        socket.broadcast.to(user.room).emit('message', await generateMessage('', `${user.name} has joined!`));


        socket.on('disconnect', async () => {
            const user = await getUser(socket.id);
    
            socket.emit('user-disconnected');
    
            if(user){
                io.to(user.room).emit('message', generateMessage('',`${user.name} has left!`));
            }
        });
    

        callback();
    });

    

    

    // socket.on('getRoomMessages', async ({roomId}, callback) => {
    //     const messages = await getRoomMessages(roomId);
    //     callback(messages);
    // });

 
});


/*
* LISTEN TO PORT
*/
server.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})
