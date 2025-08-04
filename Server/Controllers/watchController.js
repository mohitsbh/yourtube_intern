import videofile from "../Models/videofile.js";
import User from "../Models/Auth.js";

// ⏱️ Validate & Track Daily Watch Time (Per Video)
export const watchVideoController = async (req, res) => {
  try {
    const { videoid, watchTime } = req.body; // ⏱️ in minutes
    const userId = req.user.id;

    if (!videoid || typeof watchTime !== "number" || watchTime <= 0) {
      return res.status(400).json({ message: "Invalid videoid or watchTime" });
    }

    const [user, video] = await Promise.all([
      User.findById(userId),
      videofile.findById(videoid), // ⬅️ use videofile model
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!video) return res.status(404).json({ message: "Video not found" });

    const plan = user.plan || "free";
    const maxWatchTime =
      plan === "gold" ? Infinity : user.videoDurationLimit || 5;
    const today = new Date().toDateString();

    // 🔄 Reset if date changed
    if (user.lastWatchDate !== today) {
      user.lastWatchDate = today;
      user.dailyWatchHistory = {};
    }

    user.dailyWatchHistory = user.dailyWatchHistory || {};

    const alreadyWatched = user.dailyWatchHistory[videoid] || 0;
    const totalToday = alreadyWatched + watchTime;

    if (totalToday > maxWatchTime) {
      return res.status(403).json({
        message: `⛔ Daily watch time limit exceeded (${maxWatchTime} min).`,
        watched: alreadyWatched,
        attempted: watchTime,
      });
    }

    // ✅ Allow watching and track it
    user.dailyWatchHistory[videoid] = totalToday;
    await user.save();

    res.status(200).json({
      message: `✅ Watched ${watchTime} min. Remaining: ${
        maxWatchTime - totalToday
      } min.`,
      watched: totalToday,
      plan,
    });
  } catch (error) {
    console.error("⚠️ Watch Time Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while validating watch time" });
  }
};
