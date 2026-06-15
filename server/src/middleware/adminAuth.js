import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing admin token" });

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");
    const decoded = jwt.verify(token, secret);
    if (!decoded.adminId) {
      return res.status(401).json({ message: "Not an admin token" });
    }
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!roles.includes(req.admin.role)) {
      return res
        .status(403)
        .json({ message: `Requires one of: ${roles.join(", ")}` });
    }
    next();
  };
}

export function signAdminToken(admin) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const expiresIn = process.env.JWT_EXPIRES || "7d";
  return jwt.sign(
    { adminId: admin._id.toString(), role: admin.role, email: admin.email },
    secret,
    { expiresIn }
  );
}
