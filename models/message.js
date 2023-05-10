const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: {
    type: String,
    required: true
  }
});

const MessageSchema = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  images: {
    type: [ImageSchema]
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  numberOfLikes: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  parentPost:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  parentChat:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }
});

MessageSchema.pre("save", function (next) {
    this.timestamp = new Date();
    next();
  });

  




module.exports = mongoose.model("Message", MessageSchema);
