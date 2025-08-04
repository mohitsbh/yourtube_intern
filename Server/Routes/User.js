// import express from "express";
// import { login } from "../Controllers/Auth.js";
// import {
//   updatechaneldata,
//   getallchanels,
// } from "../Controllers/channel.js";

// const router = express.Router();

// // 🔐 User login
// router.post("/login", login);

// // 📝 Update channel data by channel ID
// router.patch("/update/:id", updatechaneldata);

// // 📺 Get all channels
// router.get("/getallchannel", getallchanels);

// export default router;

import express from "express";
import { getCurrentUser, login } from "../Controllers/Auth.js";
import { updatechaneldata, getallchanels } from "../Controllers/channel.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/users/login
 * @desc Google OAuth-based login (auto-register if user not found)
 * @access Public
 */
router.post("/login", login);
router.get("/me", auth, getCurrentUser);
/**
 * PATCH /api/users/update/:id
 * @desc Update a specific channel by ID
 * @access Public (🔒 Consider adding `auth` middleware if needed)
 */
router.patch("/update/:id", auth, updatechaneldata);

/**
 * GET /api/users/getallchannel
 * @desc Retrieve all channels
 * @access Public
 */
router.get("/getallchannel", getallchanels);

export default router;
