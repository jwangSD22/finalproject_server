const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: {
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
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
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
  aboutMe: {
    type: String,
    maxLength:500
  },
  profilePhoto: {
    type: ImageSchema
  },
  privateProfile: {
    type: Boolean,
    default: false
  }
});

UserSchema.index({ privateProfile: 1, 'posts.timestamp': -1 });


module.exports = mongoose.model('User', UserSchema);
