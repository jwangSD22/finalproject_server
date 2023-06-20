const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const s3 = require('../controllers/s3instance');
const bucketName = process.env.BUCKET_NAME;


const ImageSchema = new Schema({
  s3key: {
    type: String,
    required: true
  }
});

const PostReferenceSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatReferenceSchema = new Schema({
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const FriendSchema = new Schema({
  friend: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required:true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'waiting', 'blocked'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  posts: {
    type: [PostReferenceSchema]
  },
  chats: {
    type: [ChatReferenceSchema]
  },
  friends: {
    type: [FriendSchema]
  },
  friendRequests: {
    type: [FriendSchema]
  },
  bgPhoto: {
    type: ImageSchema
  },
  profilePhoto: {
    type: ImageSchema
  },
  privateProfile: {
    type: Boolean,
    default: false
  }
});

UserSchema.virtual('imageURLs').get(async function() {
  if(this.profilePhoto){
    const imgKey = this.profilePhoto
    const params = {
      Bucket: bucketName,
      Key:imgKey.s3key,
      Expires:3600,
    }
    const url = s3.getSignedUrl('getObject',params)
  return url
  }
  else return 'NO PROFILE PHOTO'


})

UserSchema.virtual('bgURL').get(async function() {
  if(this.bgPhoto){
    const imgKey = this.bgPhoto
    const params = {
      Bucket: bucketName,
      Key:imgKey.s3key,
      Expires:3600,
    }
    const url = s3.getSignedUrl('getObject',params)
  return url
  }
  else return null


})



UserSchema.index({ privateProfile: 1, 'posts.timestamp': -1 });


module.exports = mongoose.model('User', UserSchema);
