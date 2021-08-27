const mongoose = require('mongoose');
const chatSchema = require('./chatSchema.js');

const options = {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
   useCreateIndex: true,
   poolSize: 50,
   autoIndex: false, // Don't build indexes
   bufferMaxEntries: 0,
   connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
   family: 4, // Use IPv4, skip trying IPv6
};

const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URL, options).then(r => {
   console.log('MongoDB connected successfully');
}).catch(r => {
   console.log(r);
});

module.exports = {
   chat_tb: mongoose.model('chat_tb', new Schema(chatSchema.chat_tb),'chat_tb'),
   msg_tb: mongoose.model('msg_tb', new Schema(chatSchema.msg_tb),'msg_tb'),
};

