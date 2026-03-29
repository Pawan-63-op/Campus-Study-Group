import { sql } from '../dbUtils/sql_utl/sql_connector.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export async function loginHandler(req, res) {
    try {
        const { email, password } = req.body;
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'user does not exist',
                jwt: null,
                Uid: null
            });
        }
        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: 'error',
                message: 'invalid password',
                jwt: null,
                Uid: null
            });
        }
        const token = jwt.sign({ Uid: user.userID }, process.env.JWT_SECRET || "MOKSHU_SECRET", { expiresIn: '1h' });
        return res.status(200).json({
            status: 'success',
            message: 'login successful',
            jwt: token,
            Uid: user.userID
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function registerHandler(req, res) {
    try {
        const { email, username, password } = req.body;
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'user already exists',
                jwt: null,
                Uid: null
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let token, userId;
        const result = await sql`INSERT INTO users (email,username,password,created_at) VALUES (${email},${username},${hashedPassword},NOW())`;
        userId = result.insertId;
        token = jwt.sign({ Uid: userId }, process.env.JWT_SECRET || 'MOKSHU_SECRET', { expiresIn: '1h' });
        return res.status(201).json({
            status: 'success',
            message: 'user registered successfully',
            jwt: token,
            Uid: userId
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}