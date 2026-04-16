import { pool } from "./dbUtils/sql_utl/db.js"
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import { sql } from "./dbUtils/sql_utl/sql_connector.js";
import redis from "./dbUtils/redisConnect.js";
import dotenv from 'dotenv';
import groupChatRouter from "../backend/routes/groupRoutes.js"
dotenv.config();
const app = express();
import { connectToDatabase } from './dbUtils/mongoConnect.js';
app.use(cors());
app.use(express.json());
await connectToDatabase();

await sql`CREATE TABLE IF NOT EXISTS users (
    userID BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`
await sql`
CREATE TABLE IF NOT EXISTS groupChatRequest (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    groupChatId VARCHAR(255) NOT NULL,
    requester_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_request UNIQUE (groupChatId, requester_id)
);
`

app.use('/api/auth', authRoutes)
app.use('/api/friends', friendRoutes);
app.use('/api/group', groupChatRouter);

if (process.env.NODE_ENV !== "test") {
    app.listen(3000, () => console.log("Server running"));
}
export default app;