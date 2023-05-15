const mongoose = require("mongoose");
const Message = require("./message");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  chatid: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  ],
});

ChatSchema.virtual("preview").get(async function () {
  try {
    if (this.messages.length > 0) {
      //THIS IS GRABBING THE LAST MESSAGE IN THE ARRAY...
      const previewMessageID = this.messages[this.messages.length - 1];
      const messageData = await Message.findOne(previewMessageID);

      return messageData.message.slice(0, 25);
    } else {
      return "";
    }
  } catch (err) {
    console.log(err);
    throw new Error("Error retrieving top comments");
  }
});

ChatSchema.virtual("populateMessages").get(async function () {
    const messageData = await Promise.all(
      (this.messages).map(async (messageID) => {
        const message = await Message.findOne({ _id: messageID }).populate("author");
  
        return {
          messageID: messageID,
          username: message.author.username,
          text: message.message,
          images: await message.imageURLs,
        };
      })
    );
    return messageData
  

  //return an array of objects that contain the messageID, author's username, message, images-converted to presigned url
});



module.exports = mongoose.model("Chat", ChatSchema);
