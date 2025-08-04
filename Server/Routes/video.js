import express from "express";
import upload from "../Helper/filehelper.js";
import auth from "../middleware/auth.js";

// 🎥 Core video routes
import { uploadvideo, getallvideos } from "../Controllers/video.js";
import { likevideocontroller } from "../Controllers/like.js";
import { viewscontroller } from "../Controllers/views.js";

// 🕘 History
import {
  historycontroller,
  deletehistory,
  getallhistorycontroller,
} from "../Controllers/History.js";

// 🕒 Watch Later
import {
  addToWatchLater,
  getAllWatchLater,
  deleteWatchLater,
} from "../Controllers/watchlater.js";

// ❤️ Liked Videos
import {
  likedvideocontroller,
  getalllikedvideo,
  deletelikedvideo,
} from "../Controllers/likedvideo.js";
import { getAvailableResolutions } from "../Controllers/downloadController.js";

const router = express.Router();

// ==================== 🎥 Video Routes ====================

// 🔼 Upload video (auth + multer)
router.post("/uploadvideo", auth, upload.single("video"), uploadvideo);

// 📥 Fetch all videos
router.get("/getvideos", getallvideos);

// ==================== 👍 Like & 👁️ View ====================

// ❤️ Like a video by ID
router.patch("/like/:id", auth, likevideocontroller);

// 👁️ Increase view count
router.patch("/view/:id", viewscontroller);

// ==================== 🕘 History ====================

// ➕ Add video to history
router.post("/history", auth, historycontroller);

// 📜 Get full watch history
router.get("/getallhistory", auth, getallhistorycontroller);

// ❌ Delete user's full history
router.delete("/deletehistory/:userId", auth, deletehistory);

// ==================== 🕒 Watch Later ====================

// ➕ Add to watch later
router.post("/watchlater", auth, addToWatchLater);

// 📜 Get all watch later items
router.get("/getallwatchlater", auth, getAllWatchLater);

// ❌ Remove from watch later
router.delete("/deletewatchlater/:videoid", auth, deleteWatchLater);

// ==================== ❤️ Liked Videos ====================

// ➕ Like a video (recorded in a separate model)
router.post("/likevideo", auth, likedvideocontroller);

// 📜 Get all liked videos
router.get("/getalllikedvideo", auth, getalllikedvideo);

// ❌ Remove liked video entry
router.delete("/deletelikevideo/:videoid/:viewer", auth, deletelikedvideo);
router.get("/:videoid/resolutions", auth, getAvailableResolutions);
export default router;
