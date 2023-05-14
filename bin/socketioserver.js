const socketIO = require('socket.io');



const socketio = (server) =>{

    const io = socketIO(server, {
        path: "/socketio",
        cors: {
          origin:'http://localhost:3006'
        }
      });
      
      //logic for socketIO connection
      io.on("connection", (socket) => {

        console.log(
          `Socket ${socket.id} connected from ${socket.request.headers.host}`
          
        );
        console.log('Connected sockets:', io.sockets.sockets.keys());

      
        socket.on("join-room", (roomid) => {
          console.log(`joining room ${roomid}`);
          socket.join(roomid);
          io.to(roomid).emit("user-joined", "A new user has joined the room");
        });


        socket.on('sendMessage', messageObject => {
            console.log(messageObject)
        })

        socket.on('disconnect', () => {
            console.log(`${socket.id} has disconnected`);
          });

      });
      

      //on sendmessage --> need to add to database and reply back  in 'newMessage ' --> needs to send back
      //exactly what the future component will require for generating each message block

      //on connection, the axios request should be getting all the message objects and polling back for the info needed to generate componnents

      




} 

  module.exports = socketio

