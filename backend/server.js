import {pool} from "./dbUtils/sql_utl/db.js"
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
const app = express();
import { connectToDatabase } from './dbUtils/mongoConnect.js';
app.use(cors());
app.use(express.json());
await connectToDatabase();

app.use('/api/auth',authRoutes)
app.use('/api/friends',friendRoutes);
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});