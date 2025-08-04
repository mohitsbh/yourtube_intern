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

const upload = multer({ storage });


// 🌐 WebRTC ICE Server config (for STUN/TURN)
export const getWebRTCConfig = (req, res) => {
  res.status(200).json({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      // Add TURN server here if needed
    ],
  });
};

// 💾 Save uploaded WebRTC recording (to /recordings)
export const saveRecording = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  res.status(200).json({
    success: true,
    message: "Recording saved successfully",
    filename: req.file.filename,
    relativePath: `/recordings/${req.file.filename}`,
  });
};
