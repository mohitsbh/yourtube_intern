// routes/recordingRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import { saveRecording } from "../Controllers/recordingController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/recordings");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload", auth, upload.single("recording"), saveRecording); // /api/recording/upload

export default router;
