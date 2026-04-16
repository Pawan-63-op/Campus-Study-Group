import { sql } from "../dbUtils/sql_utl/sql_connector.js";
import jwt from 'jsonwebtoken';
export async function identify(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MOKSHU_SECRET');
        const userId = decoded.Uid;
        const users = await sql`SELECT * FROM users WHERE userID = ${userId}`;
        if (users.length === 0) {
            return res.status(403).json({ error: 'malicious activity detected wrong jwt correctly signed' });
        }
        req.user = users[0];
        return next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Invalid token' });
    }
}