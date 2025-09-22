# สถาปัตยกรรมระบบ (Architecture)

ระบบนี้ถูกออกแบบเป็น **Mini SIEM Platform** สำหรับการเก็บรวบรวม (ingest), จัดเก็บ (store), วิเคราะห์ (analyze) และแจ้งเตือน (alert) ข้อมูลเหตุการณ์ความปลอดภัย (security events) จากหลายแหล่ง โดยรองรับการทำงานแบบ **multi-tenant** 

---

## 🎯 หลักการออกแบบ
1. **แยกส่วนประกอบชัดเจน** → Backend (API + Logic), Frontend (Dashboard), Ingest (รับ Logs), Database  
2. **รองรับ Multi-tenant** → ทุก Log ที่บันทึกจะมี `tenant` กำกับ ทำให้สามารถแยกข้อมูลระหว่างลูกค้า/หน่วยงานได้  
3. **Alerting แบบ Rule-based** → กำหนดเงื่อนไขง่ายๆ เช่น "Login Failures > 5 ครั้งจาก IP เดียวกันใน 5 นาที"  
4. **Retention Policy** → ลบ Logs ที่เก่ากว่า 7 วัน (ตั้งค่าได้)  
5. **ติดตั้งง่าย** → รองรับทั้ง Appliance (docker-compose) และ SaaS (cloud-native)  

---

## 🛠 ส่วนประกอบหลัก
- **Frontend** → React Dashboard (Tailwind + shadcn/ui) สำหรับผู้ใช้ดูข้อมูลและบริหารจัดการ  
- **Backend API** → Node.js/Express เชื่อมต่อฐานข้อมูล, Auth (JWT), Alert Engine  
- **Ingest Layer** → รับ Logs ได้หลายช่องทาง:
  - Syslog (UDP/TCP 514)  
  - REST API (`/ingest`)  
  - Agent script (Python/ Shell)  
- **Database** → Postgres (เก็บ Logs, Users, Alerts, Tenants)  
- **Alerting** → Rule-based Engine (ตรวจ pattern + ส่ง Email/Webhook)  

---

## 🔀 Data Flow

+---------------------+       +-----------------+
| Firewall / EDR /    |       |  Cloud (AWS,    |
| Syslog Sources      |-----> |  Microsoft 365) |
+---------------------+       +-----------------+
              |                        |
              +--------> Ingest Layer <+
                          (Syslog, API)
                                 |
                           Normalization
                                 |
                          +---------------+
                          |   Database    |
                          +---------------+
                             |         |
                             |         +--> Alert Engine --> Email/Webhook
                             |
                         Backend API
                             |
                        Frontend Dashboard


### mermaid
flowchart LR
    FW[Firewall / EDR / Cloud / M365] -->|Syslog / API| IN[Ingest Layer]
    IN --> NORM[Normalization]
    NORM --> DB[(Database)]
    DB --> API[Backend API]
    API --> FE[Frontend Dashboard]
    API --> ALERT[Alert Engine]
    ALERT -->|Email/Webhook| USER[Security Analyst]


## Multi-tenant Model

ตาราง logs มีฟิลด์ tenant (varchar) ทุกแถว → ใช้แยกข้อมูลของแต่ละองค์กร

ผู้ใช้ (users) จะผูกกับ tenant เดียวหรือหลาย tenant

Query / Dashboard จะกรองข้อมูลตาม tenant ของผู้ใช้เสมอ

ตัวอย่างโครงสร้างตาราง logs

| id | tenant  | message                   | severity | timestamp           | status   |
| -- | ------- | ------------------------- | -------- | ------------------- | -------- |
| 1  | tenantA | Failed login from 1.1.1.1 | 5        | 2025-09-22 10:15:00 | new      |
| 2  | tenantB | Firewall blocked port 22  | 3        | 2025-09-22 10:17:20 | resolved |
