require('dotenv').config()
const express = require('express');
const {json, urlencoded} = require('express');
const helmet = require('helmet');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const router = require('./routes.js');
const cors = require('cors');
const { socketStatus } = require('./helpers/socketHelper.js');
const { onlineStatus } = require('./helpers/socketHelper.js');
const { socketTyping } = require('./helpers/socketHelper.js');
const { socketMessage } = require('./helpers/socketHelper.js');
const { socketJwtMiddleware } = require('./helpers/middleWareHelper.js');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const io = new Server(server, {
   cors: {
      origin: '*',
      methods: ['GET', 'POST'],
   },
});

app.use(helmet());
app.use(compression());
app.disable('x-powered-by');
app.use(fileUpload());
app.use(json({limit: process.env.JSON_LIMIT, type: 'application/json'}));
app.use(urlencoded({limit: process.env.JSON_LIMIT, extended: false}));

app.use(cors());
app.use('/chat', router);

const websiteNameSpace = io.of('/website');
websiteNameSpace.on('connection', socket => {

});

const sessionNameSpace = io.of('/session');
sessionNameSpace.use(socketJwtMiddleware);

sessionNameSpace.on('connection', socket => {
   const session = socket.session;
   const { user_id = null, user_type, full_name, user_email } = session;
   if (user_id) {
      socket.join(user_id);
      onlineStatus(socket,true)
   }

   //events
   socket.on('status',socketStatus(socket,sessionNameSpace,io))
   socket.on('message', socketMessage(socket))
   socket.on('typing', socketTyping(socket))
   socket.on('disconnect',()=>{
      onlineStatus(socket,false)
      socket.session={};
   })
   
});

server.listen('4000', () => {
   console.log('Server running on 4000');
});

