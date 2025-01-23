import { User } from "../Models/user.model.js";

import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
  try {
    const token = await (req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""));

    if (!token) {
      throw new Error("Un-Authorized Access!");
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findByPk(decodeToken?.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      throw new Error("Invalid Access Token.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user.role === "admin") {
      throw new Error("You Are not Admin!");
    }
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export { verifyJWT, verifyAdmin };
