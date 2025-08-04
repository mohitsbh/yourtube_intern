// routes/voipRoutes.js
import express from "express";
import { getWebRTCConfig, saveRecording } from "../Controllers/voipController.js";
import auth from "../middleware/auth.js";
import { uploadRecording } from "../middleware/multer.js";

const router = express.Router();

// ✅ STUN/TURN config for WebRTC
router.get("/webrtc-config", auth, getWebRTCConfig);

// ✅ Save WebRTC local recording
router.post("/record", auth, uploadRecording.single("file"), saveRecording);

export default router;
