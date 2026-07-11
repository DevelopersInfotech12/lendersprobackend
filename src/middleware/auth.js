import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { JWT_SECRET } from "../config/jwt.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(new AppError("Not authenticated. Please log in.", 401));

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Session expired. Please log in again.", 401));
      }
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
      return next(new AppError("Account not found.", 401));
    }
    if (!user.isActive) return next(new AppError("Account is disabled.", 403));

    req.user = user;
    next();
  } catch (err) {
    next(new AppError("Authentication failed.", 401));
  }
};

export default protect;
