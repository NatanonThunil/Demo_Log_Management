// retention.js
import pool from "./db.js"; // ใช้ ES Module import

/**
 * Cleanup old logs
 * ลบ logs ที่เก่ากว่า 7 วัน
 */
export async function cleanup() {
  try {
    const [result] = await pool.query(
      "DELETE FROM logs WHERE ts < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    console.log(`Old logs cleaned up, affected rows: ${result.affectedRows}`);
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}
