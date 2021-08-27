const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const chatSchema = {
   chat_tb: {
      members: [{
         user_id: ObjectId,
         role: { type: String, enum: ['employer', 'job_seeker'] }
      }],
      chat_status: { type: Boolean, default: true },
      chat_type: { type: String, default: 'private', enum: ['private', 'group'] },
      delete_status: { type: Boolean, default: false },
      chat_update_time: { type: Date, default:Date.now()}
   },
   msg_tb: {
      content: String,
      chat_id:ObjectId,
      from_id:ObjectId,
      msg_type: {
         type: String,
         enum: ['file', 'text', 'reply', 'notification', 'link'],
         default: 'text',
      },
      file_id:{type: String,ref:'upload_tb'},
      reply_id: { type: ObjectId, ref: 'msg_tb' },
      msg_status: {
         sent: { type: Date, default: Date.now() },
         read: { type: Date },
      },
      delete_status: { type: Boolean, default: false },
      msg_time: { type: Date, default: Date.now() },
   },
};

module.exports = chatSchema


