import http from "http"
import express from "express"
import { Server } from "socket.io"
//  we will use a bit of in memory store aswell... no problem
import Redis from "ioredis";
import { GroupChat } from "./models/groupChat";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

const redis = new Redis(
    {
        host: "127.0.0.1",
        port: 6379
    }
);

async function pushToredis(groupChatId, message) {
    await redis.rpush(groupChatId, JSON.stringify(message));
}
io.on("connection", async (socket) => {
    console.log("new socket connected : ", socket.id);
    socket.on("join-group-chat", async ({ groupChatId }) => {
        socket.join(groupChatId);

        const raw = await redis.lrange(groupChatId, 0, -1);
        let history;

        if (raw.length > 0) {
            history = raw.map(r => JSON.parse(r));
        } else {
            const group = await GroupChat.findById(groupChatId);
            if (!group) return;

            history = group.messages;

            for (const message of history) {
                await pushToredis(groupChatId, message);
            }
        }

        socket.emit("chat-history", history);
    });

    socket.on("send-message", async ({ groupChatId, message }) => {
        if (!groupChatId || !message) return;

        socket.to(groupChatId).emit("receive-message", message);

        await redis.rpush(groupChatId, JSON.stringify(message));

        const group = await GroupChat.findById(groupChatId);
        if (!group) return;
        // please dont try to optimise this ... we are not going to run this in prod ...
        // we will atmost handle a loadd of 2 users with 10 or more chats...so no problem if it fails please keep this intact 
        // and please see the message structure in the group chat model for corrrect frontend call
        group.messages.push(message);
        await group.save();
    });
    socket.on("disconnect", () => {
        console.log("socket disconnected : ", socket.id);
    });
})

server.listen(5002, () => {
    console.log("chat server up and running on port : 5002");
})
