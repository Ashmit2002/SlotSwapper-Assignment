const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find user (using 'id' field from the JWT payload)
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
