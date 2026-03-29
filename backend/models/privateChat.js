import mongoose  from "mongoose";
//  user to user chat 
//  chat_id will be generated like , there are two users ua,ub => chat_id = min(ua,ub) + '_' + max(ua,ub)
// chat fetching and storing must be handled correctly 
// this will be completely a web based application so make sure you are using browser based caching in the frontend.
// how will the workflow go on
    // -> first user a opens chat page with user b , then the chat is fetched from mongo db then showed on the frontend 
    // within the same time , create a socket which has the id of chat_id ok . 
    // create a  similar session in redis for instant storage of the  chat 
    // as soon as the user leaves please flush the sate to mongo db 
    // so it is not that we are creating something easy it should be good.
    // make sure if redis size of a session increases more than a threshold flush it to mongo db
const privateChatSchema = new mongoose.Schema({
    chat_id : {type:String,required:true,unique:true},
    messages: [
        {
            sender_id : {type:String,required:true},
            content : {type:String},
            fetchables : [{type:String}],
            timestamp : {type:Date,default:Date.now}
        }
    ]
});
export const PrivateChat = mongoose.model('PrivateChat',privateChatSchema);
