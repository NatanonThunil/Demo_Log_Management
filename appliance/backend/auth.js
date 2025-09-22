// auth.js
import jwt from "jsonwebtoken";
import pool from "./db.js";
import bcrypt from "bcryptjs";

/**
 * Login API
 * รับ username/password, ตรวจสอบ และส่ง token กลับ
 */
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username=?",
      [username]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid username or password" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid username or password" });

    // สร้าง token โดยเก็บ tenant และ role
    const token = generateToken(user);

    res.json({ token, role: user.role, tenant: user.tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * Middleware ตรวจสอบ JWT Token
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Middleware ตรวจสอบสิทธิ์ role
 * @param {string|string[]} allowedRoles - ตัวอย่าง: "admin" หรือ ["admin","viewer"]
 */
export function requireRole(allowedRoles) {
  if (typeof allowedRoles === "string") allowedRoles = [allowedRoles];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No token" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

/**
 * สร้าง JWT Token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      tenant: user.tenant,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}
