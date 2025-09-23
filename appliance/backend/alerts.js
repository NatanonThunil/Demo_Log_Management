// alerts.js
import pool from "./db.js";

/**
 * สร้าง Alert ลงฐานข้อมูล
 */
export async function createAlert(tenant, message, severity = 5) {
  try {
    await pool.query(
      `INSERT INTO alerts (tenant, message, severity, status, timestamp)
       VALUES (?, ?, ?, 'new', NOW())`,
      [tenant, message, severity]
    );
    console.log("🚨 Alert created:", message);
  } catch (err) {
    console.error("createAlert error:", err);
  }
}

/**
 * ตรวจสอบ login failed จาก IP
 * ถ้าเกิน 3 ครั้งใน 5 นาที → lock user 1 นาที + alert
 */
export async function checkAlerts(log) {
  if (log.event_type === "app_login_failed" && log.src_ip && log.user) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as failCount 
         FROM logs 
         WHERE event_type='app_login_failed'
           AND src_ip=? 
           AND tenant=? 
           AND ts >= NOW() - INTERVAL 5 MINUTE`,
        [log.src_ip, log.tenant]
      );

      const failCount = rows[0].failCount;

      if (failCount >= 3) {
        // 🔒 Lock account 1 นาที
        const lockedUntil = new Date(Date.now() + 60 * 1000);
        await pool.query(
          `INSERT INTO user_locks(username, locked_until)
           VALUES(?, ?)
           ON DUPLICATE KEY UPDATE locked_until=?`,
          [log.user, lockedUntil, lockedUntil]
        );

        // สร้าง Alert
        await createAlert(
          log.tenant,
          `User ${log.user} locked for 1 minute after ${failCount} failed logins from IP ${log.src_ip}`,
          9 // severity สูงสุด
        );
      }
    } catch (err) {
      console.error("checkAlerts error:", err);
    }
  }
}
