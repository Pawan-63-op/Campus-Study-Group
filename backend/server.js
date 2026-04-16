import { pool } from "./dbUtils/sql_utl/db.js"
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import { sql } from "./dbUtils/sql_utl/sql_connector.js";
import redis from "./dbUtils/redisConnect.js";
import dotenv from 'dotenv';
import groupChatRouter from "../backend/routes/groupRoutes.js"
import { connectToDatabase } from './dbUtils/mongoConnect.js';
import sessionRoutes from "../backend/routes/sessionRoutes.js"
import cookieParser from "cookie-parser";




dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
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
await sql`
CREATE TABLE IF NOT EXISTS session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    groupChatId VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    session_topic VARCHAR(255),
    venue VARCHAR(255),
    created_by BIGINT
);
`;

app.use('/api/auth', authRoutes);
app.use('/api/group', groupChatRouter);
app.use('/api/sessions',sessionRoutes);

const PORT = process.env.PORT_NUMBER || 5000
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`server running on port number ${PORT}`));
}
export default app;