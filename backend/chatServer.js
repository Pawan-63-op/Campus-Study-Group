import http from "http"
import express from "express"
// import jwt from "jsonwebtoken";
import { Server } from "socket.io"
import mysql from "mysql2/promise";
//  we will use a bit of in memory store aswell... no problem
import Redis from "ioredis";
import { GroupChat } from "./models/groupChat.js";
import jwt from "jsonwebtoken";
import { sql } from "./dbUtils/sql_utl/sql_connector.js";
import { connectToDatabase } from "../backend/dbUtils/mongoConnect.js"
import { configDotenv } from "dotenv";
await configDotenv();
const app = express();
const server = http.createServer(app);
await connectToDatabase();
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
        const group = await GroupChat.findById(groupChatId);
            if (!group) return;

        const raw = await redis.lrange(groupChatId, 0, -1);
        let history;
        const memberIds = group.group_members.map(Number);
        let users = [];
        for (const memberId of memberIds) {
            const user = await sql`SELECT * FROM users WHERE userID = ${memberId}`;
            if (user.length > 0) {
                users.push(user[0]);
            }
        }
        console.log("GROUP MEMBERS:", group.group_members);
        console.log("USERS IN CHAT:", group.group_members, users);
        if (raw.length > 0) {
            history = raw.map(r => JSON.parse(r));
        } else {
            

            history = group.messages;

            for (const message of history) {
                await pushToredis(groupChatId, message);
            }
        }
        console.log(history);
        socket.emit("chat-users",users);
        socket.emit("chat-history", history);
    });


    // utility function to generate UUID 
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    socket.on("send-message", async ({ groupChatId, message }) => {
        if (!groupChatId || !message) return;
        message.message_id = generateUUID();
        // collision possibility tends to 0.
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

    socket.on("delete-post", async ({ groupChatId, userId, postId }) => {
        try {
            console.log("DELETE RECEIVED:", postId);
            const users = await sql`SELECT * FROM users WHERE userID = ${userId}`;
            if (users.length === 0) return;

            const group = await GroupChat.findById(groupChatId);
            if (!group) return;

            if (!group.group_admins?.map(String).includes(String(userId))) return;

            const newMessages = group.messages.filter(
                msg => String(msg.message_id) !== String(postId)
            );

            group.messages = newMessages;
            await group.save();

            await redis.del(groupChatId);
            if (newMessages.length > 0) {
                await redis.rpush(
                    groupChatId,
                    ...newMessages.map(m => JSON.stringify(m))
                );
            }

            // ✅ single correct emit
            io.to(groupChatId).emit("message-deleted", {
                msgId: postId
            });

        } catch (err) {
            console.error(err);
        }
    });

    socket.on("disconnect", () => {
        console.log("socket disconnected : ", socket.id);
    });
})

server.listen(5002, () => {
    console.log("chat server up and running on port : 5002");
})
