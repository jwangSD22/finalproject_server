const mongoose = require('mongoose');
const User = require('./user')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  s3key: {
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
});

MessageSchema.virtual('imageURLs').get(async function() {
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




MessageSchema.pre("save", function (next) {
    this.timestamp = new Date();
    next();
  });



  




module.exports = mongoose.model("Message", MessageSchema);
