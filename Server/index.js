import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import nodemailer from "nodemailer";

// ✅ Route Imports
import userRoutes from "./Routes/User.js";
import videoRoutes from "./Routes/video.js";
import commentRoutes from "./Routes/comment.js";
import groupRoutes from "./Routes/Group.js";
import messageRoutes from "./Routes/message.js";
import downloadRoutes from "./Routes/download.js";
import paymentRoutes from "./Routes/payment.js";
import voipRoutes from "./Routes/voip.js";
import watchRoutes from "./Routes/watch.js";
import invoiceRoutes from "./Routes/invoice.js";
import themeRoutes from "./Routes/theme.js";
import recordingRoutes from "./Routes/recordingRoutes.js";
// ✅ App Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

// ✅ MongoDB Strict Mode
mongoose.set("strictQuery", true);

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "2000mb" }));
app.use(express.urlencoded({ extended: true, limit: "2000mb" }));

// ✅ Directory Handling
const __dirname = path.resolve();
const recordingsDir = path.join("recordings");

if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/recordings", express.static(recordingsDir));

// ✅ Health Check Routes
app.get("/", (_, res) => res.send("YourTube API is running ✅"));
app.get("/health", (_, res) => res.send("🟢 Server healthy"));

// ✅ Main API Routes
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/comment", commentRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/voip", voipRoutes);
app.use("/api/watch", watchRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/recording", recordingRoutes);

// ✅ 404 Handler
app.use("*", (_, res) =>
  res.status(404).json({ message: "API route not found" })
);

// ✅ Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Socket.IO Event Handlers
io.on("connection", (socket) => {
  console.log("🟢 New client connected");

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`🧑‍🤝‍🧑 Joined group: ${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    console.log(`👋 Left group: ${groupId}`);
  });

  socket.on("sendMessage", ({ groupId, message }) => {
    if (!message?.content) return;
    io.to(groupId).emit("receiveMessage", message);
  });

  // WebRTC Call Events
  socket.on("joinCall", ({ groupId, userId }) => {
    socket.join(groupId);
    socket.to(groupId).emit("notifyCall", { caller: userId, groupId });
  });

  socket.on("leaveCall", ({ groupId, userId }) => {
    socket.leave(groupId);
    socket.to(groupId).emit("endCall", { caller: userId, groupId });
  });

  // Signaling (Offer/Answer/Candidate)
  socket.on("offer", ({ offer, to }) => {
    socket.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    socket.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  // Video Call Email Invites
  socket.on(
    "startVideoCall",
    async ({ groupId, caller, members, roomLink }) => {
      io.to(groupId).emit("videoCallInvite", { caller, roomLink });

      try {
        await Promise.all(
          members.map((email) =>
            transporter.sendMail({
              from: `"YourTube Group Call" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: `${caller} started a video call`,
              text: `Join the call here: ${roomLink}`,
            })
          )
        );
        console.log("📧 Email invites sent");
      } catch (err) {
        console.error("❌ Email invite error:", err);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () =>
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
