const socketIO = require('socket.io');
const Message = require('../models/message')
const Chat = require ('../models/chat')
const User = require('../models/user')
const mongoose = require('mongoose')

const socketio = (server) =>{


    const io = socketIO(server, {
        path: "/socketio",
        cors: {
          origin:'*'
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


        //receiving message from frontend
        socket.on('sendMessage', async (messageObject) => {
            const {roomID,userid,username,text} = messageObject
            
            const room = await Chat.findOne({chatid:roomID})
            const user = new mongoose.Types.ObjectId(userid)
            const message = new Message({author:user,message:text})
            await message.save()
            room.messages.push(message)
            await room.save()
            




            io.to(roomID).emit('newMessage', {_id:message.id,username:username,text:text,messageID:message.id,timestamp:message.timestamp})
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

