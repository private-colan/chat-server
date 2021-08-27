const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./database/mongoConnect.js');
const { strReduce } = require('./helpers/middleWareHelper.js');
const { roleFind } = require('./helpers/middleWareHelper.js');
const { fetchUser } = require('./helpers/middleWareHelper.js');
const { createToUserData } = require('./helpers/middleWareHelper.js');
const { checkChatExist } = require('./helpers/databaseHelper.js');
const { JWT_KEY } = require('./config.js');
const router = express.Router();

//response middleware
router.use((req, res, next) => {
   res.success = (data) => {
      res.status(200).json({ status: true, result: data, message: 'Record fetched successfully' });
   };
   res.authFail = (data = null) => {
      res.status(200).json({ status: false, result: data, message: 'invalid session token' });
   };
   next();
});

router.use((req, res, next) => {
   const token = req.headers?.authorization;

   if (token) {
      jwt.verify(token, JWT_KEY, (err, decoded) => {
         if (!err) {
            req.session = decoded;
            req.token = token
            next();
            return
         }
         res.authFail();
      });
      return;
   }
   res.authFail();
});

router.post('/check-chat', async (req, res, next) => {
   const { user_id: from_id, user_type } = req.session;
   const token = req.token;
   const { to_id } = req.body;
   const chatFindData = await checkChatExist([from_id, to_id]);
   if (chatFindData) {
      res.success(await createToUserData(chatFindData, from_id,token));
   } else {
      res.success({
         to_details: await fetchUser({user_id:to_id,role:roleFind(user_type)},token),
         temp_chat_id:to_id
      });
   }
});

router.post('/chat-list', async (req, res, next) => {
   const { user_id: from_id, user_type } = req.session;
   const token = req.token;
   const { limit = 10, skip = 0,user_id=null } = req?.body ?? {};
   let list = await db.chat_tb.find({ 'members.user_id': user_id }).lean(true).sort({ chat_update_time: 1 }).limit(limit).skip(skip).exec();
   list = await Promise.all(list.map(async (a) => {
      const newData = await createToUserData(a,from_id,token)
      let recent_msg = '';
      const text = await db.msg_tb.findOne({chat_id:a._id}).lean().sort({msg_time:-1}).limit(1).select('content').exec();
      if (text){
         recent_msg = strReduce(text?.content ?? '',50)
      }
      return {...newData,recent_msg}
   }));
   res.success(list);
});

router.post('/msg-list', async (req, res, next) => {
   const { limit = 30, skip = 0,chat_id } = req?.body ?? {};
   const msgs = await db.msg_tb.find({chat_id}).lean().sort({ msg_time: -1 }).limit(limit).skip(skip).exec();
   res.success(msgs.reverse());
});


router.post('/details', async (req, res, next) => {
   const { user_id: from_id, user_type } = req.session;
   const token = req.token;
   const { chat_id:_id='' } = req?.body ?? {};
   if (!_id){
      return res.success({})
   }
   let data = await db.chat_tb.findOne({ _id }).lean().exec();
   data = await createToUserData(data,from_id,token)
   res.success(data);
});
module.exports = router;
