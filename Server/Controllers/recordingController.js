// Controllers/recordingController.js
import Recording from "../Models/recording.js";
import fs from "fs";
import path from "path";

export const saveRecording = async (req, res) => {
  try {
    const { originalname, filename, path: filePath, mimetype, size } = req.file;
    const saved = new Recording({
      filename,
      originalname,
      uploader: req.userId,
      path: filePath,
      size,
      mimetype,
    });

    await saved.save();
    res.status(200).json({ message: "Recording saved", data: saved });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
