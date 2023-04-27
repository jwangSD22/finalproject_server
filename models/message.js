const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  likes: {
    type: [String],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
});

MessageSchema.pre("save", function (next) {
    this.timestamp = new Date();
    next();
  });




module.exports = mongoose.model("Message", MessageSchema);
