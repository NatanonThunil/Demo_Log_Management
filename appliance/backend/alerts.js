// alerts.js
import pool from "./db.js";

// กฎ: ล็อกอินล้มเหลวซ้ำๆ จาก IP เดิมภายใน 5 นาที
export async function checkAlerts(log) {
  if (log.event_type === "app_login_failed" && log.src_ip) {
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
        await pool.query(
          `INSERT INTO alerts (tenant, message, severity, status, timestamp)
           VALUES (?, ?, ?, 'new', NOW())`,
          [
            log.tenant,
            `Login failed ${failCount} times from IP ${log.src_ip} in 5 min`,
            8 // ความรุนแรงสูง
          ]
        );

        console.log("🚨 Alert created:", log.src_ip);
      }
    } catch (err) {
      console.error("checkAlerts error:", err);
    }
  }
}
