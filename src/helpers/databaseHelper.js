const db = require('../database/mongoConnect.js');

const addMessage = async (data) => {
   const MsgTb = db.msg_tb;
   const newMsg = new MsgTb(data);
   return await newMsg.save();
};

const checkChatExist = async (members) => {
   return await db.chat_tb.findOne({ $and:[{'members.user_id':members[0]},{'members.user_id':members[1]}] }).lean().exec();
};

const createChat = async (data) => {
   const ChatTb = db.chat_tb;
   const newChat = new ChatTb(data);
   return await newChat.save();
};

module.exports = {
   addMessage,
   checkChatExist,
   createChat,
};
