const jwt = require('jsonwebtoken');
const { USER_API_ROOT, JWT_KEY } = require('../config.js');
const fetch = require('node-fetch');

const socketJwtMiddleware = (socket, next) => {
   const { authorization = null } = socket.handshake.headers;
   
   //session user
   if (authorization !== 'null' && authorization) {
      jwt.verify(authorization, JWT_KEY, (err, decoded) => {
         if (!err) {
            socket.session = decoded;
            socket.token = authorization;
            next();
         }
      });
   }
};

const roleFind = (a) => a === 'job_seeker' ? 'employer' : 'job_seeker';

const fetchUser = async ({ user_id, role }, token) => {
   if (!token) {
      console.log('token Missing');
      return;
   }
   const path = role === 'job_seeker' ? 'job-seeker' : role;
   return await fetch(`${USER_API_ROOT}/${path}/${user_id}`, { headers: { authorization: token } })
     .then(res => res.json())
     .then(({ status, result }) => {
        return result;
     }).catch(e=>{
        console.log(e);
     })
};

const createToUserData = async (chatData = null,from_id, token) => {
   if (chatData){
      const newChatData = { ...chatData };
      const toUserDetails = newChatData.members.find(({ user_id }) => user_id.toString() !== from_id);
      newChatData['to_details'] = await fetchUser(toUserDetails, token);
      return newChatData;
   }
   return {};
};

const strReduce =(str,length=30)=>{
   return str.substr(0,length)
}


module.exports = {
   socketJwtMiddleware,
   createToUserData,
   fetchUser,
   roleFind,
   strReduce
};
