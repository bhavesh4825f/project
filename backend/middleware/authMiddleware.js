import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // Normalize header (some clients send lowercase)
  let token = req.headers.authorization || req.headers.Authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  // Remove "Bearer "
  token = token.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data from token
    req.userId = decoded.id;      // 👈 you must include "id" when signing token
    req.userRole = decoded.role;  // 👈 you must include "role" when signing token

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ success: false, message: "Token failed" });
  }
};

// Admin-only middleware
export const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Admin privileges required." 
    });
  }
  next();
};
