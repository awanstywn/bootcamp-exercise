import { Router } from "express";
import { sendMessage } from "../controllers/chat";

const router = Router();

// POST — Send message and receive streaming response
router.post("/conversations/:conversationId/messages", sendMessage);

export default router;
