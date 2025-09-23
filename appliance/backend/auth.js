// auth.js
import jwt from "jsonwebtoken";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import { createAlert } from "./alerts.js";

/**
 * Format Date to Bangkok time
 */
function formatBangkokTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(date)); // แปลง Date/ISOString ให้แน่นอน
}

/**
 * Handle failed login
 */
async function handleFailedLogin(username, req, tenant = "default") {
  try {
    const srcIp = req.ip || "unknown";

    await pool.query(
      `INSERT INTO logs(ts, tenant, event_type, src_ip, user, severity, msg, raw) 
       VALUES(NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenant,
        "app_login_failed",
        srcIp,
        username,
        5,
        `Login failed for user ${username} from IP ${srcIp}`,
        JSON.stringify({ action: "login_failed", ip: srcIp }),
      ]
    );

    const [rows] = await pool.query(
      `SELECT COUNT(*) as failCount
       FROM logs 
       WHERE event_type='app_login_failed'
         AND user=?
         AND ts >= NOW() - INTERVAL 5 MINUTE`,
      [username]
    );

    const failCount = rows[0].failCount;

    if (failCount >= 3) {
      const lockedUntil = new Date(Date.now() + 60 * 1000); // lock 1 นาที // สามารถปรับเวลาได้

      await pool.query(
        `INSERT INTO user_locks(username, locked_until) 
         VALUES(?, ?)
         ON DUPLICATE KEY UPDATE locked_until=?`,
        [username, lockedUntil, lockedUntil]
      );

      await createAlert(
        tenant,
        `User ${username} locked due to ${failCount} failed logins in 5 min from IP ${srcIp}`,
        9
      );

      console.log(`🚨 User ${username} locked until ${formatBangkokTime(lockedUntil)}`);
    }
  } catch (err) {
    console.error("handleFailedLogin error:", err);
  }
}

/**
 * Login API
 */
export async function login(req, res) {
  const { username, password } = req.body;
  const srcIp = req.ip || "unknown";

  try {
    const [lockRows] = await pool.query(
      "SELECT locked_until FROM user_locks WHERE username=?",
      [username]
    );

    if (lockRows.length > 0 && new Date(lockRows[0].locked_until) > new Date()) {
      const lockedUntil = new Date(lockRows[0].locked_until);
      const lockedTimeStr = formatBangkokTime(lockedUntil);

      await pool.query(
        `INSERT INTO logs(ts, tenant, event_type, src_ip, user, severity, msg, raw)
         VALUES(NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [
          "default",
          "login_locked_attempt",
          srcIp,
          username,
          7,
          `Locked user ${username} attempted login from IP ${srcIp}`,
          JSON.stringify({ action: "login_attempt_locked", ip: srcIp }),
        ]
      );

      return res
        .status(403)
        .json({ error: `Account locked until ${lockedTimeStr}` });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username=?", [
      username,
    ]);
    if (rows.length === 0) {
      await handleFailedLogin(username, req);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      await handleFailedLogin(username, req, user.tenant);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    await pool.query(
      `INSERT INTO logs(ts, tenant, event_type, src_ip, user, severity, msg, raw)
       VALUES(NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.tenant,
        "login_success",
        srcIp,
        username,
        1, 
        `User ${username} logged in successfully from IP ${srcIp}`,
        JSON.stringify({ action: "login_success", ip: srcIp }),
      ]
    );

    await pool.query(
      "DELETE FROM logs WHERE event_type='app_login_failed' AND user=? AND ts >= NOW() - INTERVAL 5 MINUTE",
      [username]
    );

    const token = generateToken(user);
    res.json({ token, role: user.role, tenant: user.tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
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
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
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
