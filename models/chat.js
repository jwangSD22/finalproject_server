const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    chatid: {
      type: String,
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true
      }
    ]
  });
  
  ChatSchema.virtual('preview').get(async function () {
    try {

  

      if (this.messages.length>0) {

        //THIS IS GRABBING THE LAST MESSAGE IN THE ARRAY... 
        const previewMessageID = this.messages[this.messages.length-1]
        const messageData = await Message.findOne(previewMessageID).populate('author')

        return messageData.message.slice(0, 25)
        
        }
      else {
        return ''
      }    
            
          
         
      }
     catch (err) {
      console.log(err);
      throw new Error('Error retrieving top comments');
    }
  });

  module.exports = mongoose.model("Chat", ChatSchema);
