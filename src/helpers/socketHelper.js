const { roleFind } = require('./middleWareHelper.js');
const { createChat } = require('./databaseHelper.js');
const { createToUserData } = require('./middleWareHelper.js');
const { checkChatExist } = require('./databaseHelper.js');
const { addMessage } = require('./databaseHelper.js');

const socketMessage = (socket) => async (data, to_id) => {
   const { user_id:from_id, user_type } = socket.session;
   const token = socket.token;
   let { chat_id = null,temp_chat_id=null } = data;
   if (temp_chat_id){
      delete data['chat_id'];
      chat_id = null;
   }
   let chatData = {};
   data['msg_time'] = Date.now();
   data['from_id'] = from_id;
   data['msg_status'] = 'sent'; //sent,read,delete
   try {
      if (!chat_id) {
         const findCheck = await checkChatExist([from_id, to_id]);
         if (findCheck) {
            data['chat_id'] = findCheck._id;
         } else {
            chatData = await createChat({ members: [{ user_id:from_id, role: user_type }, { user_id: to_id, role: roleFind(user_type) }] });
            data['chat_id'] = chatData._id;
         }
         chatData = await createToUserData(findCheck, from_id, token);
      }
   }catch (e){
      console.log(e);
   }
   let msgData = await addMessage(data);
   msgData['chat_data'] = chatData;
   socket.to(to_id).to(from_id).emit('message', msgData);
};


const socketTyping = (socket) => async (data, to_id) => {
   const { user_id:from_id, user_type } = socket.session;
   const token = socket.token;
   let { chat_id = null } = data;
   socket.to(to_id).emit('typing',data);
}


const onlineStatus = (socket,status)=> {
   const { user_id } = socket.session;
   socket.broadcast.emit('status', { status,user_id,time:Date.now()});
}

const socketStatus = (socket,namespace,io)=>(to_id)=> {
   const { user_id } = socket.session;
   const status = namespace.adapter.rooms.has(to_id)
   namespace.in(user_id).emit('status',{ status,user_id:to_id,time:Date.now()})
}

module.exports = {
   socketMessage,
   socketTyping,
   onlineStatus,
   socketStatus
};
