import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { success } from "../utils/apiResponse.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";

const sendToken = (res, user, statusCode = 200, message = "Success") => {
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  success(res, { user, token }, message, statusCode);
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return next(new AppError("All fields required", 400));

  const exists = await User.findOne({ email });
  if (exists) return next(new AppError("Email already registered", 400));

  const user = await User.create({ name, email, password });
  sendToken(res, user, 201, "Registered successfully");
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError("Email and password required", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }
  sendToken(res, user, 200, "Logged in successfully");
};

export const logout = (_req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  success(res, null, "Logged out successfully");
};

export const getMe = (req, res) => {
  success(res, req.user, "Profile fetched");
};
