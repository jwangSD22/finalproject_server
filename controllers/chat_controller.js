const User = require("../models/user");
const Post = require("../models/post");
const Chat = require("../models/chat");
const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const s3 = require("./s3instance");
const { v4: uuidv4 } = require("uuid");

//GET create a new chat between two users
exports.get_chat = async function (req, res, next) {
  try{
    const user1ID = req.user.jwtid;
    const user2 = await User.findOne({ username: req.body.username2 });
    if(!user2){
     return res.status(400).json({error:'User does not exist'})
    }
    const user2ID = user2._id;
    const response = await Chat.findOne({
      participants: { $all: [user1ID, user2ID] },
    });
  
    if (!response) {
      //create a new chat with both users
      const newChat = new Chat({
        chatid: uuidv4(),
        participants: [user1ID, user2ID],
      });
  
      //find both mongodb entries for both users
      // plug this chat into both users' chat fields.
  
      for (let user of [user1ID, user2ID]) {
        const userInDB = await User.findOne({ _id: user });
        userInDB.chats.push(newChat);
        userInDB.save();
      }
  
      //save this chat
      newChat.save();
      return res.json(newChat);

    } else {
      res.json(response);
    }
  }
  catch(err){
    console.log(err)
    res.status(400).json({error:err})
  }

};

//GET chats for a specific user by USER ID
exports.get_all_chats = async function (req, res, next) {
  try {
    const user = await User.findOne({ _id: req.user.jwtid });
    const chats = user.chats;

    const chatData = await Promise.all(
      chats.map(async (chatid) => {
        const chatData = await Chat.findOne({ _id: chatid });
        const chatDataParticipants = [...chatData.participants];
        const partnerID = chatDataParticipants.filter(
          (id) => id !== req.user.jwtid
        );
        const partnerDB = await User.findOne({ _id: partnerID });
        const partnerName = partnerDB.fullName;
        const preview = await chatData.preview;
        return {
          ...chatData.toObject(),
          preview: preview,
          partner: partnerName,
        };
      })
    );

    res.json(chatData);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

//GET start a socket.io session for a specific chat by CHAT ID
    //at this point, you will have the private chat ID


//PUT update a specific chat's preview message by getting the first message by CHAT ID

//DELETE delete a chat session from a user's list by USER ID


/* ------------------------------ MESSAGE COMMENT ROUTES --------------------- */

//POST create a new MESSAGE for a specific chat by CHAT ID

//GET ALL MESSAGES for a specific chat by CHAT ID
exports.get_convo = async function (req,res,next) {

  const roomID = req.params.id

  try{
    const room = await Chat.findOne({chatid:roomID})

    res.json(room.populateMessages)

  }
  catch(err){
    console.log(err)
    res.status(400).json({error:err})
  }





  //needs to return json with ALL the messages 
}

//PUT update a MESSAGE for a specific CHAT ID with a new IMAGE
