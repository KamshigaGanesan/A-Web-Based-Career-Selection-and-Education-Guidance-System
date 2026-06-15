import Admin from "../models/Admin.js";
import { signAdminToken } from "../middleware/adminAuth.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await admin.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signAdminToken(admin);
    res.json({
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function seedSuperadmin(req, res) {
  try {
    const existing = await Admin.findOne({ role: "superadmin" });
    if (existing) {
      return res.status(400).json({ message: "Superadmin already exists" });
    }

    const admin = await Admin.create({
      name: "Super Admin",
      email: "admin@moosika.com",
      passwordHash: "Admin@123",
      role: "superadmin",
    });

    res.status(201).json({
      data: { id: admin._id, email: admin.email, role: admin.role },
      message: "Superadmin seeded. Login with admin@moosika.com / Admin@123",
    });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
