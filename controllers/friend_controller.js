const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const s3 = require("./s3instance");



// GET all friends of a specific user
exports.get_user_friends = async function (req,res,next) {

    try{
        const user = await User.findOne({username:req.params.username})
        const friendsArray = user.friends
      
        const friendsWithPhoto = await Promise.all(
          friendsArray.map(async friend=>{
              const friendID = friend.friend
              const status = friend.status
              const friendData = await User.findOne({_id:friendID})
      
              return {...friendData.toObject(),friendPhotoURL:await friendData.imageURLs, status:status}
          })
        )
      
      return res.json(friendsWithPhoto)
      }
      catch(err){
        console.log('No friends')
        res.json([])
      }
    }

// GET all pending of a specific user
exports.get_user_pending = async function (req,res,next) {
    const thisUser = await User.findOne({_id:req.user.jwtid})
    const thisUserPendingArray = thisUser.friendRequests

    const thisUserPendingFullData = await Promise.all(thisUserPendingArray.map(async friendSchema =>{
        const user = await User.findOne({_id:friendSchema.friend})

        return {...user.toObject(),status:friendSchema.status,profilePhotoURL:await user.imageURLs}
    }))

    console.log(thisUserPendingFullData)
    

    res.json(thisUserPendingFullData)


}



// POST send an origin friend request to dest USER from body
exports.post_friend_request = async function (req,res,next) {
const userIDEnd = req.body.userIDEnd
console.log(req.user)
try{
  const originUser = await User.findOne({username:req.user.jwtusername})
  const endUser = await User.findOne({_id:userIDEnd})
  endUser.friendRequests.push({friend:originUser,status:'pending'})
  originUser.friendRequests.push({friend:endUser,status:'waiting'})
  
  await endUser.save()
  await originUser.save()
  res.json('Friend request success')

}
catch(err){
  console.log(err)
  res.status(400).json('Friend request failed')
}
}

// POST handle remove friend request
exports.remove_friend_request = async function (req, res, next) {
  const userIDEnd = req.body.userIDEnd;
  try {
    const originUser = await User.findOne({ username: req.user.jwtusername });
    const endUser = await User.findOne({ _id: userIDEnd });


    // Remove friend request from endUser's friendRequests
    await User.updateOne(
      { _id: endUser._id },
      { $pull: { friendRequests: { friend: originUser._id } } }
    );

    // Remove friend request from originUser's friendRequests
    await User.updateOne(
      { _id: originUser._id },
      { $pull: { friendRequests: { friend: endUser._id } } }
    );

    res.json('Friend request removed successfully');
  } catch (err) {
    console.log(err);
    res.status(400).json('Failed to remove friend request');
  }
};



// POST handle pending request action
exports.handle_pending_action = async function (req, res, next) {
    const param = req.body.param;
    const originUser = await User.findOne({ _id: req.user.jwtid });
    const endUser = await User.findOne({ _id: req.body.userid });
  
    if (param === 'reject') {
      // Remove each other from friendRequests array
      originUser.friendRequests = originUser.friendRequests.filter(
        (request) => request.friend.toString() !== req.body.userid
      );
      endUser.friendRequests = endUser.friendRequests.filter(
        (request) => request.friend.toString() !== req.user.jwtid
      );
    } else if (param === 'accept') {
      // Add friends to each other's lists and update friendRequests status
      const newFriend = {
        friend: endUser._id,
        status: 'accepted',
      };
  
      originUser.friends.push(newFriend);
      originUser.friendRequests = originUser.friendRequests.filter(
        (request) => request.friend.toString() !== req.body.userid
      );
  
      endUser.friends.push({ friend: originUser._id, status: 'accepted' });
      endUser.friendRequests = endUser.friendRequests.map((request) =>
        request.friend.toString() === req.user.jwtid
          ? { ...request, status: 'accepted' }
          : request
      );
    } else if (param === 'close') {
      // Remove the endUser from originUser's friendRequests
      originUser.friendRequests = originUser.friendRequests.filter(
        (request) =>
          request.friend.toString() !== req.body.userid ||
          request.status !== 'accepted'
      );
    } else {
      return res.status(400).json('NOT VALID REQUEST');
    }
  
    // Save the updated documents
    await originUser.save();
    await endUser.save();
  
    res.status(200).json('Request handled successfully');
  };
