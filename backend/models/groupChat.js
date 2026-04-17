import mongoose from "mongoose";
// functionality of group chat is mostly same as private chat but just the room size is different and chat_id will be group_id instead of person_ids....
const groupChatSchema = new mongoose.Schema({
    group_id: { type: String, required: true, unique: true },
    group_admins: [{ type: String, required: true }],
    group_members: [{ type: String, required: true }],
    group_name: { type: String, required: true },
    group_contents: [{ type: String }],
    group_topics: [{ type: String }],
    requires_permission: Boolean,
    messages: [
        {
            message_id: { type: String, required: true },
            sender_id: { type: String, required: true },
            content: { type: String },
            fetchables: [
                {
                    url: { type: String },
                    type: { type: String }
                }
            ],
            timestamp: { type: Date, default: Date.now }
        }
    ]
});
groupChatSchema.index({
    group_name: "text",
    group_topics: "text",
    group_contents: "text"
});
export const GroupChat = mongoose.model('GroupChat', groupChatSchema);