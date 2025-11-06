const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const swapRoutes = require("./routes/swap.route");
const path = require("path");

const app = express();

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

app.use("/api/auth", authRoutes);
app.use("/api", swapRoutes);

const staticDir = path.join(__dirname, "../../frontend/dist");
app.use(express.static(staticDir));

app.use((req, res, next) => {
 
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api")) return next();

  const acceptHTML =
    req.headers.accept && req.headers.accept.includes("text/html");
  const isAsset = req.path.includes(".");

  if (!acceptHTML || isAsset) return next();

  return res.sendFile(path.join(staticDir, "index.html"));
});

module.exports = app;
