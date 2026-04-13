import { GroupChat } from "../models/groupChat.js";
import { sql } from "../dbUtils/sql_utl/sql_connector.js";
import { request } from "express";
export async function join_groupChat(req,res){
    try {
        const user_id = req.user.userId
        const group_chat_id = req.body.group_chat_id
        const groupChat = await GroupChat.findById(group_chat_id);
        if(groupChat==null){
            return res.status(404).json({
                error: "group chat not found ",
                status : "errored",
                result : null,
            });
        }
        // INSERT INTO users (email,username,password,created_at) VALUES
        const user = await sql`
        select * from 
        users 
        where userId = ${user_id} `;
        //  should not happen at all since all the jwts are signed only using valid userids ... but in case of theft of secret it is useful and robus
        if(user.length==0){
            return res.status(404).json({
                error: "user not foung ",
                status : "errored",
                result : null,
            });
        }
        // if the group chat requires admin validation or not .....
        // table looks like 
        // froup_chat_id , requester
        if(groupChat.requires_permission===true){
            const requests = await sql`
            select * 
            from groupChatRequest 
            where group_chat_id=${group_chat_id} and requester_id = ${user_id}
            `
            if(requests.length>0){
                return res.status(409).json({
                    error : "request already exists bro chill",
                    status : "errored",
                    result : null
                });
            }
            const insertResult = await sql`
            insert into groupChatRequest (group_chat_id,requester_id,email,username) values (${group_chat_id},${user_id},${user.email},${user.username})
            `
            return res.status(200).json({
                error:null,
                status : "success",
                result : insertResult 
            });
        }else{
            if(groupChat.group_members.includes(user_id)){
                return res.status(409).json({
                    error : "user already in group",
                    status : "errored",
                    result : null
                });
            }
            groupChat.group_members.push(user_id);
            await groupChat.save();
            return res.status(200).json({
                error:null,
                status : "success",
                result : "joined group successfully"
            });
        }
        
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
export async function get_groupChats_where_I_am_admin(req,res){
    try {
        // userId is a string not a mongoose Id object 
    const userId = req.user.userId;
    const groups = await GroupChat.find({
        group_admins: userId
    });
    return res.status(200).json(
            {
                status: "ok",
                result : groups,
                error :null,
            }
        )
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function get_my_groupChats(req,res){
    try{
        const userId  = req.user.userId;
        const groups = await GroupChat.find({
            group_members : userId
        });
        return res.status(200).json(
            {
                status: "ok",
                result : groups,
                error :null,
            }
        )
    }catch(e){
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function get_groupChat_chat(req,res) {
    try {
        const userId = req.user.userId;
        const groupId = req.body.group_id;
        const group = await GroupChat.findById(groupId);
        if(!group.group_members.includes(userId)){
            return res.status(403).json({
                status : "errored:data steal detected",
                error : "forbidden access",
                result : null
            })
        }
        const chat = group.messages
        return res.status(200).json({
            result : chat,
            status : "ok",
            error : null
        })
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function accept_join_request(req,res){
    try {
        const groupId = req.body.groupId;
        const requesterId = req.body.requesterId;
        const adminId = req.user.userId;

        // insert into groupChatRequest (group_chat_id,requester_id,email,username)
        const requests = await sql`
        select * from 
        groupChatRequest where  group_chat_id = ${groupId} and requester_id = ${requesterId}
        `;
        if(requests.length==0){
            return res.status(301).json({
                status : "already accepted by you or some other admin ",
                error : null,
                result : 1
            })
        }
        const group = await GroupChat.findById(groupId);
        if(!group.group_admins.includes(adminId)){
            return res.status(403).json({
                status : "errored:data steal detected",
                error : "forbidden access",
                result : null
            })
        }
        group.group_members.concat(requesterId);
        await group.save();

        const deleteRes = await sql`
        delete from groupChatRequest where group_chat_id = ${groupId} and requester_id = ${requesterId}
        `
        return res.status(201).json({
            status:"ok",
            result : deleteRes,
            error:null
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function get_join_requests_for_my_group(req,res){
    try{
        const groupId = req.groupId;
        const userId = req.user.userId;
        const group = await GroupChat.findById(groupId);
        if(!group.group_admins.includes(userId)){
            return res.status(403).json({
                status : "errored:data steal detected",
                error : "forbidden access",
                result : null
            })
        }
        const requests = await sql`
        select * from groupChatRequest where group_chat_id = ${groupId}
        `
        return res.status(200).json({
            result : requests,
            status : "ok",
            error : null
        });
    }catch(e){
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function get_groups_by_id_then_semantically(req, res) { 
    try {
        const query = req.body.query;

        // 1. Try exact match by ID
        const group = await GroupChat.findById(query);
        if (group) {
            return res.status(200).json({
                result: group,
                status: "ok",
                error: null
            });
        }

        // 2. Semantic (partial) search on group_name
        const groups = await GroupChat.find({
            group_name: { $regex: query, $options: "i" } // case-insensitive
        });

        return res.status(200).json({
            result: groups,
            status: "ok",
            error: null
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }  
}

// -> group chat handling . 
// -> event/study session handling .
// -> 