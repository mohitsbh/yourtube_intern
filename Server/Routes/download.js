import express from "express";
import {
  downloadVideo,
  getDownloads,
  getDownloadCount,
  getAvailableResolutions,
} from "../Controllers/downloadController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 📜 Get user's download history
router.get("/my-downloads", auth, getDownloads);

// 📊 Get remaining daily download quota
router.get("/count", auth, getDownloadCount);



// 📥 Download a video (resolution-based with plan limits)
router.get("/:videoid", auth, downloadVideo);

// 🧾 Get available resolutions for a specific video
router.get("/:videoid/resolutions", getAvailableResolutions);

export default router;
