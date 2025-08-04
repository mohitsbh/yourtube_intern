import express from "express";
import {
  postcomment,
  getcomment,
  deletecomment,
  editcomment,
  likeComment,
  dislikeComment,
  translateComment,
} from "../Controllers/Comment.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ➕ Post a new comment (with auth)
router.post("/post", auth, postcomment);

// 📥 Get all comments (public)
router.get("/get", getcomment);

// 🗑 Delete comment (auth)
router.delete("/delete/:id", auth, deletecomment);

// ✏️ Edit comment (auth)
router.patch("/edit/:id", auth, editcomment);

// 👍 Like a comment (auth)
router.patch("/like/:id", auth, likeComment);

// 👎 Dislike a comment (auth, auto-delete if 2)
router.patch("/dislike/:id", auth, dislikeComment);

// 🌐 Translate a comment (public)
router.post("/translate/:id", translateComment);

export default router;
