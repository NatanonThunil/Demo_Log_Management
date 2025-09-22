import { filterFieldsByRole } from "./middleware/rbac.js";

app.get("/logs", verifyToken, requireRole(["admin","viewer"]), async (req,res)=>{
  try {
    const [rows] = await pool.query(
      "SELECT * FROM logs WHERE tenant=? ORDER BY ts DESC LIMIT 100",
      [req.user.tenant]
    );
    const filtered = filterFieldsByRole(rows, req.user.role);
    res.json({ rows: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});
