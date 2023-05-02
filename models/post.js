const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: {
      type: String,
      required: true
    }
  });
  
  const PostSchema = new Schema({
    author: {
      type: String,
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
    likes: {
      type: [String],
      index: true
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true
      }
    ],

    numberOfComments:{
      type: Number
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

PostSchema.index({ timestamp: -1 });


module.exports = mongoose.model("Post", PostSchema);
