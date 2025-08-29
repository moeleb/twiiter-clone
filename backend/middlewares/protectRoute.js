import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("Token from cookie:", token);

  if (!token) {
    return res.status(401).send("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).send("Not authorized, token failed");
    }

    const user = await User.findById(decoded.id).select("-password"); // ✅ use decoded.id
    console.log("Decoded user ID:", decoded.id);

    if (!user) {
      return res.status(401).send("Not authorized, user not found");
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send("Not authorized, token failed");
  }
};

export default protectRoute;

