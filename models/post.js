const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const s3 = require('../controllers/s3instance');
const bucketName = process.env.BUCKET_NAME;
const User = require('../models/user')
const Message = require('../models/message')
const Post = require('../models/post')


const ImageSchema = new Schema({
    s3key: {
      type: String,
      required: true
    }
  });
  
  const PostSchema = new Schema({
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    images: {
      type: [ImageSchema]
    },
    postMessage: {
      type: String,
      required: true,
      maxlength: 1000
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      }
    ],

    numberOfLikes: {
      type: Number,
      default: 0
    },

    numberOfComments:{
      type: Number,
      default: 0
    }
    ,
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  });

PostSchema.virtual('getFullNameAndUsername').get(
  async function () {
    let user = await User.findOne(this.author)
    return {fullName:user.fullName, username:user.username}
  }
)

PostSchema.virtual('getAvatar').get(
  async function () {
    let user = await User.findOne(this.author)
    return user.imageURLs
  }
)



PostSchema.virtual('topCommentsSnippet').get(async function () {
  try {
    if (this.numberOfComments > 0) {
      const comments = this.comments.slice(0, 3);
      const commentData = await Promise.all(comments.map(async commentId => {
        const comment = await Message.findById(commentId).populate('author');
        
        return {
          message: comment.message.slice(0, 25),
          author: comment.author.fullName
        };
      }));
       return commentData;
    }
  } catch (err) {
    console.log(err);
    throw new Error('Error retrieving top comments');
  }
});



PostSchema.virtual('imageURLs').get(async function() {
  const imgKeys = this.images
  const finalArray = []

  for(let key of imgKeys){
    const params = {
      Bucket: bucketName,
      Key:key.s3key,
      Expires:3600,
    }
    const url = s3.getSignedUrl('getObject',params)
    finalArray.push(url)
  }

  return finalArray
})

PostSchema.index({ timestamp: -1 });


module.exports = mongoose.model("Post", PostSchema);


   // test code to see if i can pull back the URL from the newly created object
    // const params = {
    //   Bucket: bucketName,
    //   Key: objectKey,
    //   Expires: 3600,
    // };
    // const url = s3.getSignedUrl("getObject", params);
    // console.log(url);
