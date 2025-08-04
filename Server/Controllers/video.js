import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import videofile from "../Models/videofile.js";
import Channel from "../Models/Channel.js";

// 🛠️ Set FFmpeg path (Adjust based on OS)
ffmpeg.setFfmpegPath(
  process.env.FFMPEG_PATH ||
    "C:\\Users\\mohit\\Downloads\\ffmpeg-7.1.1-essentials_build\\ffmpeg-7.1.1-essentials_build\\bin\\ffmpeg.exe"
);

// 🎞️ Generate video resolutions
const generateResolutions = (inputPath, baseName, outputFolder) => {
  const resolutions = {
    "360p": "640x360",
    "480p": "854x480",
    "720p": "1280x720",
    "1080p": "1920x1080",
  };

  return Promise.all(
    Object.entries(resolutions).map(([label, size]) => {
      const outputPath = path.join(outputFolder, `${baseName}-${label}.mp4`);
      return new Promise((resolve) => {
        ffmpeg(inputPath)
          .output(outputPath)
          .videoCodec("libx264")
          .size(size)
          .on("end", () => resolve({ label, path: outputPath }))
          .on("error", (err) => {
            console.error(`❌ Error generating ${label}:`, err.message);
            resolve({ label, path: null });
          })
          .run();
      });
    })
  );
};

// 🖼️ Generate thumbnail
const generateThumbnail = (inputPath, baseName, outputFolder) => {
  const thumbnailPath = path.join(outputFolder, `${baseName}.jpg`);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .on("end", () => resolve(thumbnailPath))
      .on("error", reject)
      .screenshots({
        timestamps: ["5"],
        filename: `${baseName}.jpg`,
        folder: outputFolder,
        size: "320x240",
      });
  });
};

// ⬆️ Upload video
export const uploadvideo = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No video file uploaded" });
    if (!req.user?.id && !req.user?._id)
      return res.status(401).json({ message: "Unauthorized" });

    const uploader = req.user.id || req.user._id;
    const { title, chanel } = req.body;

    const originalFilename = req.file.originalname;
    const inputPath = req.file.path;
    const baseName = title.replace(/[^\w\s-]/gi, "").replace(/\s+/g, "_");
    const outputFolder = path.dirname(inputPath);

    // Create thumbnail directory
    const thumbnailFolder = path.join("uploads", "thumbnails");
    if (!fs.existsSync(thumbnailFolder))
      fs.mkdirSync(thumbnailFolder, { recursive: true });

    // 🎞️ Generate resolutions
    const resolutionResults = await generateResolutions(
      inputPath,
      baseName,
      outputFolder
    );
    const resolutionPaths = new Map();

    console.log(`📦 Generated Resolutions for "${title}":`);
    for (const { label, path: fileAbsPath } of resolutionResults) {
      if (fileAbsPath && fs.existsSync(fileAbsPath)) {
        const relativePath = "uploads/" + path.basename(fileAbsPath);
        resolutionPaths.set(label.toLowerCase(), relativePath);
        console.log(`✅ ${label}: ${relativePath}`);
      } else {
        console.warn(`⚠️ ${label}: Failed to generate`);
      }
    }

    // 🖼️ Generate thumbnail
    const thumbnailPath = await generateThumbnail(
      inputPath,
      baseName,
      thumbnailFolder
    );
    const relativeThumbnail = path
      .relative("uploads", thumbnailPath)
      .replace(/\\/g, "/");
    console.log("🎯 Final resolutionPaths:", resolutionPaths);
    console.log("🎯 Object.fromEntries:", Object.fromEntries(resolutionPaths));

    // 💾 Save to MongoDB
    const file = new videofile({
      videotitle: title,
      filename: originalFilename,
      filepath: path.relative("uploads", inputPath).replace(/\\/g, "/"),
      filetype: req.file.mimetype,
      filesize: req.file.size,
      uploader,
      videochanel: chanel,
      resolutions: Object.fromEntries(resolutionPaths),
      thumbnail: relativeThumbnail,
    });

    await file.save();
    res
      .status(200)
      .json({ message: "✅ Video uploaded and processed successfully", file });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// 📥 Get all videos
export const getallvideos = async (req, res) => {
  try {
    const videos = await videofile
      .find()
      .populate("uploader", "name")
      .populate("videochanel", "name")
      .sort({ createdAt: -1 });

    videos.forEach((vid, i) => {
      const resolutionsObj =
        vid.resolutions instanceof Map
          ? Object.fromEntries(vid.resolutions)
          : vid.resolutions || {};

      const availableRes = Object.entries(resolutionsObj)
        .filter(([_, val]) => typeof val === "string" && val.trim())
        .map(([res]) => res);

      console.log(
        `🎬 Video #${i + 1} "${vid.videotitle}" has: ${
          availableRes.length > 0 ? availableRes.join(", ") : "None"
        }`
      );
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching videos", error: error.message });
  }
};

// ✅ Get video by ID with available resolutions
export const getVideoById = async (req, res) => {
  try {
    const video = await videofile.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const resolutionPaths =
      video.resolutions instanceof Map
        ? Object.fromEntries(video.resolutions)
        : video.resolutions || {};

    const availableResolutions = {};

    for (const [res, filePath] of Object.entries(resolutionPaths)) {
      const fullPath = path.join("uploads", path.basename(filePath));
      if (fs.existsSync(fullPath)) {
        availableResolutions[res] = filePath;
      }
    }

    res.status(200).json({
      ...video.toObject(),
      availableResolutions,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching video", error: err.message });
  }
};
