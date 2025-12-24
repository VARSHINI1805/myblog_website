import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword
  });

  res.status(201).json({ message: "User registered successfully" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: false
  });

  res.json({ message: "Login successful" });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json({ user });
};
