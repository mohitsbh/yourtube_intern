import fs from "fs";
import path from "path";
import Video from "../Models/videofile.js";
import User from "../Models/Auth.js";
import Download from "../Models/download.js";

const PLAN_LIMITS = {
  free: 1,
  bronze: 3,
  silver: 5,
  gold: Infinity,
};

// 🧾 GET remaining downloads for today
export const getDownloadCount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toISOString().split("T")[0];
    const lastDate = user.lastDownloadDate?.toISOString().split("T")[0];

    if (lastDate !== today) {
      user.downloadsToday = 0;
      user.lastDownloadDate = new Date();
      await user.save();
    }

    const limit = PLAN_LIMITS[user.plan || "free"];
    const remaining =
      limit === Infinity
        ? "Unlimited"
        : Math.max(0, limit - user.downloadsToday);

    res.status(200).json({ plan: user.plan, remaining });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ GET available resolutions for a video
export const getAvailableResolutions = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoid);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const rawResolutions =
      video.resolutions instanceof Map
        ? Object.fromEntries(video.resolutions)
        : video.resolutions || {};

    const available = [];

    for (const [res, relPath] of Object.entries(rawResolutions)) {
      if (!relPath || typeof relPath !== "string") continue;

      const fullPath = path.isAbsolute(relPath)
        ? relPath
        : path.join(process.cwd(), relPath);

      if (fs.existsSync(fullPath)) {
        available.push(res.trim().toLowerCase());
      } else {
        console.warn(`⚠️ Missing file for resolution ${res}: ${fullPath}`);
      }
    }

    return res.status(200).json({ available });
  } catch (error) {
    console.error("❌ Resolution fetch error:", error);
    res.status(500).json({ message: "Error fetching resolutions", error });
  }
};

// 📥 DOWNLOAD a video with resolution and plan check
export const downloadVideo = async (req, res) => {
  console.log("🔽 Download request:", {
    videoid: req.params.videoid,
    resolution: req.query.resolution,
  });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const video = await Video.findById(req.params.videoid);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const resolution = (req.query.resolution || "720p").trim().toLowerCase();

    const rawResolutions =
      video.resolutions instanceof Map
        ? Object.fromEntries(video.resolutions)
        : video.resolutions || {};

    const normalized = {};
    for (const key in rawResolutions) {
      normalized[key.trim().toLowerCase()] = rawResolutions[key];
    }

    const fileRelPath = normalized[resolution];
    if (!fileRelPath) {
      return res
        .status(400)
        .json({ message: `Resolution '${resolution}' not available` });
    }

    const fullPath = path.isAbsolute(fileRelPath)
      ? fileRelPath
      : path.join(process.cwd(), fileRelPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Video file not found" });
    }

    // Plan-based quota check
    const today = new Date().toISOString().split("T")[0];
    const lastDate = user.lastDownloadDate?.toISOString().split("T")[0];

    if (lastDate !== today) {
      user.downloadsToday = 0;
      user.lastDownloadDate = new Date();
    }

    const limit = PLAN_LIMITS[user.plan || "free"];
    if (limit !== Infinity && user.downloadsToday >= limit) {
      return res
        .status(403)
        .json({ message: `Daily limit reached for plan: ${user.plan}` });
    }

    // Prepare download stream
    const stat = fs.statSync(fullPath);
    res.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-Length": stat.size,
      "Content-Disposition": `attachment; filename="${video.videotitle}-${resolution}.mp4"`,
    });

    // Stream video
    const readStream = fs.createReadStream(fullPath);
    readStream.pipe(res);

    // Save download info asynchronously (don’t block response)
    readStream.on("close", async () => {
      try {
        user.downloadsToday += 1;
        user.downloadHistory.push({
          videoid: video._id,
          resolution,
          downloadedAt: new Date(),
        });
        await user.save();

        // Update metrics
        const metrics = video.metrics?.[resolution] || {
          views: 0,
          downloads: 0,
        };
        metrics.downloads += 1;
        video.metrics = {
          ...video.metrics,
          [resolution]: metrics,
        };
        await video.save();

        // Log download
        await Download.create({
          userId: user._id,
          videoid: video._id,
          resolution,
          downloadedAt: new Date(),
          plan: user.plan,
        });
      } catch (error) {
        console.error("⚠️ Error saving download metrics/log:", error);
      }
    });
  } catch (error) {
    console.error("❌ Download error:", error);
    res.status(500).json({ message: "Download error", error: error.message });
  }
};

// 📚 GET download history
export const getDownloads = async (req, res) => {
  try {
    const downloads = await Download.find({ userId: req.userId })
      .populate("videoid", "videotitle thumbnail resolutions")
      .sort({ downloadedAt: -1 });

    res.status(200).json(downloads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching downloads", error });
  }
};
