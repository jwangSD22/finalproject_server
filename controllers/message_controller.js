const User = require("../models/user");
const Post = require("../models/post");
const Message = require("../models/message")
const { body, validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const s3 = require("./s3instance");

//POST create a new COMMENT for a specific post by POST ID
//// params: id
exports.post_comment = async function(req,res,next) {
const postID = req.params.id
const user = req.user.jwtusername
const message = req.body.message

try{
    const post = await Post.findOne({_id:postID})
    const author = await User.findOne({username:user})
    
    const comment = new Message({
        author:author,
        message:message,
        parentPost: post
    })
    
    comment.save()
    post.comments.push(comment)
    post.numberOfComments++
    post.save()

    res.json(comment)
    
}
catch(err){
    res.status(400).json({error:err})
}

/* 
message schema includes: 
author -- pull from token
message -- req.body.message
images -- comments wont have images -- 
likes -- wont originally have likes
timestamp -- auto completed
parentPost 
parentChat -- not a chat

**** need to add validation for the message itself to set restrictions
*/
}

//GET ALL COMMENTS for a specific post by POST ID



//PUT update a COMMENT by MESSAGE ID to add **LIKES**




//POST create a new MESSAGE for a specific chat by CHAT ID

//GET ALL MESSAGES for a specific chat by CHAT ID

//PUT update a MESSAGE for a specific CHAT ID with a new IMAGE


//DELETE comment on a post by COMMENT ID and update POST

//DELETE message in a chat by MESSAGE ID and update CHAT