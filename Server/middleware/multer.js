// middleware/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure "recordings" directory exists
const recordingsDir = path.resolve("recordings");
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

// 🎥 Multer disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${sanitizedName}`);
  },
});

export const uploadRecording = multer({ storage });
