import history from "../Models/history.js";

// 🕘 Add to history (avoids duplicates & updates timestamp)
export const historycontroller = async (req, res) => {
  const { videoid, viewer } = req.body;
  if (!videoid || !viewer) {
    return res.status(400).json({ message: "Missing videoid or viewer" });
  }

  try {
    await history.findOneAndUpdate(
      { videoid, viewer },
      { $set: { viewedOn: new Date() } },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "History added or updated" });
  } catch (error) {
    console.error("❌ Add to History Error:", error.message);
    res.status(500).json({ message: "Failed to add to history" });
  }
};

// 📄 Get all history entries (optionally filtered by viewer)
export const getallhistorycontroller = async (req, res) => {
  const { viewer } = req.query;

  try {
    const query = viewer ? { viewer } : {};
    const files = await history.find(query).populate("videoid");
    res.status(200).json(files);
  } catch (error) {
    console.error("❌ Fetch History Error:", error.message);
    res.status(500).json({ message: "Failed to retrieve history" });
  }
};

// 🗑️ Delete all history for a user
export const deletehistory = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    await history.deleteMany({ viewer: userId });
    res.status(200).json({ message: "History cleared for user" });
  } catch (error) {
    console.error("❌ Delete History Error:", error.message);
    res.status(500).json({ message: "Failed to delete history" });
  }
};
