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

const { generateMessage } = require('./utils/old');
const {addUser, removeUser,getUser, getUsersInRoom, getRoomMessages} = require('./utils/temp');



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

    socket.on('join', async ({name, room}, callback) => {
        const {error, user} = addUser({
            id: socket.id,
            name,
            room
        });

        if(error){
            return callback(error);
        }

        socket.join(user.room);
        // socket.join(room);

       
        let clientIds = Object.keys( io.of('/').connected );

        io.sockets.in(clientIds[0]).emit('getCurrentPlaybackTime');

        socket.on('sendCurrentPlaybackPosition', (pp) =>{
            socket.broadcast.to(room).emit('playbackposition', pp);
        });


        socket.on('scrubber-move', function(currentPositionText){
            let clientIds = Object.keys( io.of('/').connected );

            if(socket.id === clientIds[0]){
                const user = getUser(socket.id);
                io.emit('message', generateMessage(`${user.name} - Admin`, `Jumped to ${currentPositionText}`));
            }
            io.sockets.in(clientIds[0]).emit('getCurrentPlaybackTime');
    
            socket.on('sendCurrentPlaybackPosition', (pp) =>{
                socket.broadcast.to(room).emit('playbackposition', pp);
            });
        });
    
       

        socket.emit('message', generateMessage('Admin', `Welcome ${name}!`));

        socket.on('sendMessage', ({body, name}, callback) => {
            const user = getUser(socket.id);
            io.to(user.room).emit('message', generateMessage(user.name, body));
            callback();
        });


        socket.on('pause', async ({name, room}) => {
                const user = await getUser(socket.id);
    
                socket.to(room).emit('paused');
                io.to(user.room).emit('message', generateMessage(user.name, 'Paused the video'));
        })
    
    
        socket.on('play', async ({name, room}) => {
                const user = await getUser(socket.id);;
                socket.to(room).emit('played');

                io.to(user.room).emit('message', generateMessage(user.name, 'Played the video'));
        })

        // socket.broadcast.to(user.room).emit('message', await generateMessage('Admin', `${user.name} has joined!`,{
        //     type: 'event', 
        //     roomId: user.room,
        //     socketId: socket.id
        // }));

        callback();
    });

    

    

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

   

 
});


/*
* LISTEN TO PORT
*/
server.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})
