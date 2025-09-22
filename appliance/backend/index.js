// index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

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

// Ingest logs (ทุกคนที่ล็อกอินได้)
app.post("/ingest", verifyToken, async (req, res) => {
  const log = req.body;
  const q =
    "INSERT INTO logs(ts,tenant,event_type,src_ip,dst_ip,user,severity,msg,raw) VALUES(?,?,?,?,?,?,?,?,?)";

  try {
    await pool.query(q, [
      log.ts,
      log.tenant,
      log.event_type,
      log.src_ip,
      log.dst_ip,
      log.user,
      log.severity,
      log.msg,
      log.raw,
    ]);

    await checkAlerts(log);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
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
