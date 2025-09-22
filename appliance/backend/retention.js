import pool from "./db.js"; // ถ้าใช้ db ก็ import ด้วย ES Module

export async function cleanup() {
  try {
    // ตัวอย่าง: ลบ logs เก่ากว่า 7 วัน
    await pool.query("DELETE FROM logs WHERE ts < DATE_SUB(NOW(), INTERVAL 7 DAY)");
    console.log("Old logs cleaned up");
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}
