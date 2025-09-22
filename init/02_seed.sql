-- เพิ่มผู้ใช้เริ่มต้น (รหัสผ่านเข้ารหัสแล้วจะดีกว่า)
INSERT INTO users (username, password, role, tenant)
VALUES
('admin', '$2a$10$0HVZz5Dk8sC4/h9PqZlB9OHGq9Nq..9MZlmZlI05oK.y6qJXhF5b2', 'admin', 'demo'),
('viewer', '$2a$10$0HVZz5Dk8sC4/h9PqZlB9OHGq9Nq..9MZlmZlI05oK.y6qJXhF5b2', 'viewer', 'demo');
--รหัสผ่านตัวอย่างนี้ใช้ bcrypt hash ของคำว่า password (คุณสามารถสร้าง hash ใหม่ได้ด้วย bcryptjs หรือ htpasswd)

-- เพิ่ม alert ตัวอย่าง
INSERT INTO alerts (tenant, message, severity, status)
VALUES
('demo', 'Multiple failed login attempts detected', 7, 'new'),
('demo', 'Firewall blocked suspicious traffic', 8, 'ack');