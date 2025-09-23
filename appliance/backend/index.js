// index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import bcrypt from "bcryptjs";
import pool from "./db.js";
import { login, verifyToken, requireRole } from "./auth.js";
import { checkAlerts } from "./alerts.js";
import { cleanup } from "./retention.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ===== Routes =====

// Login
app.post("/login", login);

// register
app.post("/register", async (req, res) => {
  const { username, password, tenant = "default" } = req.body;

  try {
    // ตรวจสอบ username ซ้ำ
    const [rows] = await pool.query("SELECT * FROM users WHERE username=?", [username]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // สร้าง user ใหม่
    await pool.query(
      "INSERT INTO users(username, password, tenant, role) VALUES(?, ?, ?, ?)",
      [username, hashed, tenant, "viewer"] // default role = viewer
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Ingest logs (ทุกคนที่ล็อกอินได้)
app.post("/ingest", verifyToken, async (req, res) => {
  const log = req.body;

  try {
    await pool.query(
      "INSERT INTO logs(ts,tenant,event_type,src_ip,dst_ip,user,severity,msg,raw) VALUES(?,?,?,?,?,?,?,?,?)",
      [
        log.ts || new Date(),
        log.tenant,
        log.event_type,
        log.src_ip,
        log.dst_ip,
        log.user,
        log.severity,
        log.msg,
        JSON.stringify({ ...log, action: log.event_type })
      ]
    );

    await checkAlerts(log);
    res.json({ ok: true });
  } catch (err) {
    console.error("Ingest log error:", err);
    res.status(500).json({ error: "Failed to ingest log" });
  }
});


// Fetch logs for current tenant (admin + viewer)
app.get("/logs", verifyToken, requireRole(["admin", "viewer"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM logs WHERE tenant=? ORDER BY ts DESC LIMIT 100",
      [req.user.tenant]
    );
    res.json({ rows }); // frontend จะได้ rows เป็น array
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});


// Admin-only route: ดูทุก tenant logs
app.get("/admin/logs", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM logs ORDER BY ts DESC LIMIT 500"
    );
    res.json({ rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin logs" });
  }
});

// Admin-only: Fetch all users
app.get("/admin/users", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT username, role, tenant FROM users");
    res.json({ rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// Fetch alerts for current tenant (admin + viewer)
app.get("/alerts", verifyToken, requireRole(["admin","viewer"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, tenant, message, severity, status, timestamp 
       FROM alerts 
       WHERE tenant=? 
       ORDER BY timestamp DESC 
       LIMIT 50`,
      [req.user.tenant]
    );
    res.json({ rows }); // frontend จะได้ array ของ alerts
  } catch (err) {
    console.error("Fetch alerts error:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});


// Cleanup every hour
setInterval(cleanup, 60 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
