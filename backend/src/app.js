const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const swapRoutes = require("./routes/swap.route");
const path = require("path");

const app = express();

// CORS for local dev and Render
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://slotswapper-assignment.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API routes first
app.use("/api/auth", authRoutes);
app.use("/api", swapRoutes);

// Serve frontend build (Vite dist)
const staticDir = path.join(__dirname, "../../frontend/dist");
app.use(express.static(staticDir));

// SPA fallback for non-API GET routes (Express 5-safe)
app.use((req, res, next) => {
  // Only handle GET navigations that accept HTML
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api")) return next();

  const acceptHTML =
    req.headers.accept && req.headers.accept.includes("text/html");
  const isAsset = req.path.includes("."); // e.g., /assets/app.js, /favicon.ico

  if (!acceptHTML || isAsset) return next();

  return res.sendFile(path.join(staticDir, "index.html"));
});

module.exports = app;
