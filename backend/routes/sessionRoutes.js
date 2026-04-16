import express from "express";
import { identify } from "../middleware/identify.js";

import {
    create_session,
    get_ongoing_sessions,
    get_completed_sessions,
    get_upcoming_sessions
} from "../controller/sessionController.js";

const router = express.Router();

router.use(identify);

router.post("/create-session", create_session);

router.get("/get-ongoing-sessions", get_ongoing_sessions);
router.get("/completed-sessions", get_completed_sessions);
router.get("/upcoming-sessions", get_upcoming_sessions);

export default router;