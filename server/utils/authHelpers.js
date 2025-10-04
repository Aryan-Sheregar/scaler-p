import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return { error: "Not authorized, no token", status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return { error: "User not found", status: 401 };
    }

    return { user };
  } catch (error) {
    return { error: "Not authorized, token failed", status: 401 };
  }
};

export const checkRole = (user, allowedRoles) => {
  if (!allowedRoles.includes(user.role)) {
    return {
      error: `User role ${user.role} is not authorized to access this route`,
      status: 403,
    };
  }
  return null;
};
