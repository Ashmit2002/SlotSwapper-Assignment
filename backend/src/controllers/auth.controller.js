const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      fullName: { firstName, lastName },
    } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      username,
      email,
      password: hashPassword,
      fullName: { firstName, lastName },
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function loginUser(req, res) {
  const { username, email, password } = req.body;
  try {
    const user = await userModel
      .findOne({ $or: [{ username }, { email }] })
      .select("+password");
    if (!user) {
      return res.status(400).json({ message: "No user found please login" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });
  res.status(200).json({ message: "Logout successful" });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
