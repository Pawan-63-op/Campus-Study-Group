import { sql } from "../dbUtils/sql_utl/sql_connector.js";
// depricated service .
// wont be used at all.
export async function sendFriendRequest(req, res) {
    try {
        const senderId = req.user.userID;
        const {recieverId} = req.body;

        const existingRequeest = await sql`SELECT * FROM friend_requests WHERE senderId = ${senderId} AND recieverId = ${recieverId}`;
        if(existingRequeest.length > 0) {
            return res.status(202).json({
                status: 'error',
                message: 'Friend request already sent'
            });
        }
        const existingFriendship = await sql`SELECT * FROM friends where (user1=${senderId} and user2 = ${recieverId}) or (user1 = ${recieverId} and user2 = ${senderId})`;
        if(existingFriendship.length > 0) {
            return res.status(202).json({
                status: 'error',
                message: 'You are already friends'
            });
        }

        const inverseRequest = await sql`SELECT * FROM friend_requests WHERE senderId = ${recieverId} AND recieverId = ${senderId}`;
        if(inverseRequest.length > 0) {
            await sql`DELETE FROM friend_requests WHERE senderId = ${recieverId} AND recieverId = ${senderId}`;
            await sql`INSERT INTO friends (user1,user2,created_at) VALUES (${senderId},${recieverId},NOW())`;
            return res.status(200).json({
                status: 'success',
                message: 'Friend request accepted'
            });
        }

        const result = await sql`INSERT INTO friend_requests (senderId,recieverId,created_at) VALUES (${senderId},${recieverId},NOW())`;
        return res.status(201).json({
            status: 'success',
            message: 'Friend request sent'
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const senderId = req.body.senderId;
        const recieverId = req.user.userID;
        const existingRequeest = await sql`SELECT * FROM friend_requests WHERE senderId = ${senderId} AND recieverId = ${recieverId}`;
        if(existingRequeest.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Friend request does not exist'
            });
        }
        await sql`DELETE FROM friend_requests WHERE senderId = ${senderId} AND recieverId = ${recieverId}`;
        await sql`INSERT INTO friends (user1,user2,created_at) VALUES (${senderId},${recieverId},NOW())`;
        return res.status(200).json({
            status: 'success',
            message: 'Friend request accepted'
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

export async function rejectFriendRequest(req, res) {
    try {
        const {senderId,recieverId} = req.body;
        const existingRequeest = await sql`SELECT * FROM friend_requests WHERE senderId = ${senderId} AND recieverId = ${recieverId}`;
        if(existingRequeest.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Friend request does not exist'
            });
        }
        await sql`DELETE FROM friend_requests WHERE senderId = ${senderId} AND recieverId = ${recieverId}`;
        return res.status(200).json({
            status: 'success',
            message: 'Friend request rejected'
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

export async function getFriendsList(req, res) {
    try {
        const userId = req.user.userID;
        const friends = await sql`SELECT * FROM friends WHERE user1 = ${userId} OR user2 = ${userId}`;
        const friendIds = friends.map(friend => (friend.user1 === userId ? friend.user2 : friend.user1));
        if(friendIds.length === 0) {
            return res.status(200).json({
                status: 'success',
                friends: []
            });
        }
        const friendDetails = await sql`SELECT username FROM users WHERE userID IN (${friendIds})`;
        return res.status(200).json({
            status: 'success',
            friends: friendDetails
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

export async function getFriendRequests(req,res) {
    try {
        const userId = req.user.userID;
        const senderDetails = await sql`
        select u.userId as senderId ,u.username as username from 
        users u join friend_requests fr on u.userId = fr.senderId
        where fr.recieverId = ${userId}
        `

        return res.status(200).json({
            status: 'success',
            friendRequests: senderDetails
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

export async function getSuggestions(req,res) {
    try {
        const suggestions = await sql`
        SELECT userID,username 
        FROM users 
        ORDER BY RAND() 
        LIMIT 10 
        where 
        userID != ${req.body.userId}
        `;
        return res.status(200).json({
            status: 'success',
            suggestions: suggestions
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

export async function unfriend(req,res) {
    try {
        const {userId1,userId2} = req.body;
        const existingFriendship = await sql`SELECT * FROM friends where (user1=${userId1} and user2 = ${userId2}) or (user1 = ${userId2} and user2 = ${userId1})`;
        if(existingFriendship.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'You are not friends'
            });
        }
        await sql`DELETE FROM friends where (user1=${userId1} and user2 = ${userId2}) or (user1 = ${userId2} and user2 = ${userId1})`;
        return res.status(200).json({
            status: 'success',
            message: 'Unfriended successfully'
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

export async function getMutualFriends(req,res) {
    try {
        const {userId1,userId2} = req.body;
        const mutualFriends = await sql`
            select 
                case
                    when f1.user1 = ${userId1} then f1.user2
                    else f1.user1
                end as userId
            from friends f1
            join friends f2 on
            (
            case
                when f1.user1 = ${userId1} then f1.user2
                else f1.user1
            end
            ) =
             
            (
            case
                when f2.user1 = ${userId2} then f2.user2
                else f2.user1
            )
            where 
                (f1.user1 = ${userId1} OR f1.user2 = ${userId1})
                AND (f2.user1 = ${userId2} OR f2.user2 = ${userId2})
                AND NOT (f1.user1 = f2.user1 and f1.user2 = f2.user2)
        `   ;
        const mututalfriendsIds = mutualFriends.map(friend => friend.userId);
        
        if(mutualFriends.length === 0) {
            return res.status(200).json({
                status: 'success',
                mutualFriends: []
            });
        }
        const mutualFriendDetails = await sql`SELECT username FROM users WHERE userID IN (${mututalfriendsIds})`;
        return res.status(200).json({
            status: 'success',
            mutualFriends: mutualFriendDetails
        });
    }catch(e){
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
    
}

export async function getUsersbyUsername(req,res) {
    try{
        const {username} = req.query;
        const users = await sql`SELECT userID,username FROM users WHERE username LIKE ${'%' + username + '%'}`;
        return res.status(200).json({
            status: 'success',
            users: users
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}