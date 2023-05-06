const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    s3key: {
      type: String,
      required: true
    }
  });
  
  const PostSchema = new Schema({
    author: {
      type: String,
      ref:'User',
      required: true,
      index: true
    },
    images: {
      type: [ImageSchema]
    },
    postMessage: {
      type: String,
      required: true,
      maxlength: 500
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

PostSchema.pre("save", function (next) {
  this.timestamp = new Date();
  next();
});

PostSchema.virtual('likesFullNames').get(
  ()=>{
    if(this.likes){
      return this.likes.map(like=like.fullName);
    }
    else{
      return []
    }
  }
)

PostSchema.virtual('topCommentsSnippet').get(async function () {
  const comments = this.comments.slice(0, 3);
  const commentData = await Promise.all(comments.map(async comment => {
    const author = await User.findOne({ username: comment.author });
    return {
      message: comment.message.slice(0, 25),
      author: author.fullName
    };
  }));
  return commentData;
});

PostSchema.index({ timestamp: -1 });


module.exports = mongoose.model("Post", PostSchema);
