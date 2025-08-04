import express from "express";
import {
  createGroup,
  searchGroups,
  getUserGroups,
  updateGroup,
  deleteGroup,
  updateGroupMembers,
} from "../Controllers/groupController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Create new group with member invite
router.post("/create", auth, createGroup);

// ✅ Search groups by name
router.get("/search", auth, searchGroups);


// ✅ Fetch all groups the logged-in user belongs to
router.get("/my-groups", auth, getUserGroups);

// ✅ Update group (name and members) — only creator
router.put("/:id", auth, updateGroup);

// ❌ Delete group — only creator
router.delete("/:id", auth, deleteGroup);

// ➕➖ Add/remove members — only creator
router.patch("/:id/members", auth, updateGroupMembers);

export default router;
