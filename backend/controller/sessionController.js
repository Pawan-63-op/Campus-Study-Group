import { sql } from "../dbUtils/sql_utl/sql_connector.js";
import { GroupChat } from "../models/groupChat.js";
import mongoose from "mongoose";


async function validateGroupAndMember(groupChatId, userID) {
    if (!mongoose.Types.ObjectId.isValid(groupChatId)) {
        return { error: "invalid groupChatId", status: 400 };
    }

    const group = await GroupChat.findById(groupChatId);

    if (!group) {
        return { error: "group not found", status: 404 };
    }

    const isMember = group.group_members.map(String).includes(String(userID));

    if (!isMember) {
        return { error: "not a group member", status: 403 };
    }

    return { group };
}


export async function create_session(req, res) {
    try {
        const userID = String(req.user.userID);
        const { groupChatId, start_time, end_time, session_topic, venue } = req.body;

        if (!groupChatId) {
            return res.status(400).json({ error: "groupChatId required" });
        }
        const validation = await validateGroupAndMember(groupChatId, userID);
        if (validation.error) {
            return res.status(validation.status).json({ error: validation.error });
        }
        const group = validation.group;
        const isAdmin = group.group_admins.map(String).includes(userID);
        if (!isAdmin) {
            return res.status(403).json({
                error: "only admins can create sessions"
            });
        }
        const start = start_time ? new Date(start_time) : new Date();
        const end = end_time ? new Date(end_time) : null;
        if (end && end <= start) {
            return res.status(400).json({
                error: "end_time must be after start_time"
            });
        }
        const overlapping = await sql`
            SELECT * FROM session
            WHERE groupChatId = ${groupChatId}
            AND (
                (${start} BETWEEN start_time AND IFNULL(end_time, NOW()))
                OR
                (${end || start} BETWEEN start_time AND IFNULL(end_time, NOW()))
            )
        `;

        if (overlapping.length > 0) {
            return res.status(409).json({
                error: "session overlaps with existing session"
            });
        }
        console.log("its ok")
        const result = await sql`
            INSERT INTO session (groupChatId, start_time, end_time, session_topic, venue, created_by)
            VALUES (
                ${groupChatId},
                ${start},
                ${end},
                ${session_topic || null},
                ${venue || null},
                ${userID}
            )
        `;

        return res.status(201).json({
            status: "success",
            result: {
                sessionId: result.insertId,
                groupChatId,
                start_time: start,
                end_time: end,
                session_topic,
                venue,
                created_by: userID
            }
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal server error" });
    }
}

export async function get_ongoing_sessions(req, res) {
    try {
        const { groupChatId } = req.query;
        const userID = req.user.userID;

        const validation = await validateGroupAndMember(groupChatId, userID);
        if (validation.error) {
            return res.status(validation.status).json({ error: validation.error });
        }

        const now = new Date();

        const sessions = await sql`
            SELECT * FROM session
            WHERE groupChatId = ${groupChatId}
            AND start_time <= NOW()
            AND (end_time IS NULL OR end_time >= NOW())
            ORDER BY start_time DESC
        `;
        console.log(sessions);

        return res.status(200).json({
            status: "success",
            result: sessions
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal server error" });
    }
}
export async function get_completed_sessions(req, res) {
    try {
        const { groupChatId } = req.query;
        const userID = req.user.userID;

        const validation = await validateGroupAndMember(groupChatId, userID);
        if (validation.error) {
            return res.status(validation.status).json({ error: validation.error });
        }


        const now = new Date();

        const sessions = await sql`
            SELECT * FROM session
            WHERE groupChatId = ${groupChatId}
            AND end_time IS NOT NULL
            AND end_time < NOW()
            ORDER BY end_time DESC
        `;
        console.log(sessions);

        return res.status(200).json({
            status: "success",
            result: sessions
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal server error" });
    }
}


export async function get_upcoming_sessions(req, res) {
    try {
        const { groupChatId } = req.query;
        const userID = req.user.userID;

        const validation = await validateGroupAndMember(groupChatId, userID);
        if (validation.error) {
            return res.status(validation.status).json({ error: validation.error });
        }

        const now = new Date();

        const sessions = await sql`
            SELECT * FROM session
            WHERE groupChatId = ${groupChatId}
            AND start_time > NOW()
            ORDER BY start_time ASC
        `;
        // const sessions = await sql `select * from session`;
        console.log(sessions);

        return res.status(200).json({
            status: "success",
            result: sessions
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal server error" });
    }
}