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
        author:author._id,
        message:message
    })
    
    await comment.save()
    post.comments.push(comment)
    post.numberOfComments++
    await post.save()

    res.json(comment)
    
}
catch(err){
    console.log(err)
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
exports.get_all_comments = async function(req,res,next) {
    const postID = req.params.id
    try{
        const post = await Post.findOne({_id:postID})

        const commentData = await Promise.all(post.comments.map(
            async commentID => {
                const comment = await Message.findOne({_id:commentID})
                const author = await User.findOne({_id:comment.author})
                return {...comment.toObject(),fullName:author.fullName
                    }
            }
        ))
    
        return res.json(commentData)
    }
    catch(err){
        console.log(err)
        res.status(400).res.json({error:err})
    }


}

//PUT update a COMMENT by MESSAGE ID to toggle **LIKES** status
exports.comment_toggle_like = async function (req, res, next) {
    const userId = req.user.jwtid;
    const commentID = req.params.id;
    const comment = await Message.findById(commentID);
  
    try {
      const index = comment.likes.indexOf(userId);
      if (index > -1) {
        // User already liked the post, remove the like
        comment.likes.splice(index, 1);
        comment.numberOfLikes--;
      } else {
        // User hasn't liked the post yet, add the like
        comment.likes.push(userId);
        comment.numberOfLikes++;
      }
  
      // Save the updated post and return the updated document
      const updatedComment = await comment.save();
  
      return res.json(updatedComment);
    } catch (error) {
      res.status(400).json(error);
    }
  };



//POST create a new MESSAGE for a specific chat by CHAT ID

//GET ALL MESSAGES for a specific chat by CHAT ID

//PUT update a MESSAGE for a specific CHAT ID with a new IMAGE


//DELETE comment on a post by COMMENT ID and update POST

//DELETE message in a chat by MESSAGE ID and update CHAT