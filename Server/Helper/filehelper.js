// 📂 videofile.js
import multer from "multer";
import path from "path";
import fs from "fs";

// 📁 Create "uploads" folder if it doesn't exist
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🧠 Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${timestamp}-${name}${ext}`);
  },
});

// ✅ Restrict to supported video formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["video/mp4", "video/webm", "video/ogg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "❌ Invalid file type. Only MP4, WebM, and OGG formats are allowed."
      ),
      false
    );
  }
};

// 📦 Create upload middleware (2 GB limit)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2 GB
  },
});

export default upload;
