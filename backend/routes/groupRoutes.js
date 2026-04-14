import express from "express";

import { identify } from "../middleware/identify.js";

import {
    join_groupChat,
    get_groupChats_where_I_am_admin,
    get_my_groupChats,
    get_groupChat_chat,
    accept_join_request,
    get_join_requests_for_my_group,
    get_groups_by_id_then_semantically,
    create_groupChat,
    delete_groupChat
} from "../controller/groupChatController.js";

const router = express.Router();

router.use(identify);

router.post("/create-group",create_groupChat);

// router.post("delete-post")

router.post("delete-group",delete_groupChat);

router.post("/join", join_groupChat);

router.get("/admin", get_groupChats_where_I_am_admin);

router.get("/my", get_my_groupChats);

router.post("/chat", get_groupChat_chat);

router.post("/accept-request", accept_join_request);

router.post("/requests", get_join_requests_for_my_group);

router.post("/search", get_groups_by_id_then_semantically);

export default router;
