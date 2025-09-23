# การติดตั้งระบบ (Appliance Mode)

โหมด Appliance เหมาะสำหรับการติดตั้ง **ในเครื่องเดียว (single VM/Server)** โดยใช้ Docker Compose  
เช่น สำหรับ POC, Lab หรือการใช้งานองค์กรเล็ก  

---

## 🛠 ความต้องการ (Prerequisites)
- OS: Linux (Ubuntu 22.04 แนะนำ), MacOS หรือ Windows WSL2
- ติดตั้ง **Docker** และ **Docker Compose**
- CPU ≥ 2 core, RAM ≥ 4GB, Storage ≥ 20GB

---

## 📦 ขั้นตอนการติดตั้ง

### 1. Clone Repository
```bash
git clone https://github.com/NatanonThunil/Demo_Log_Management.git
cd Demo_Log_Management

---

2. สร้างไฟล์ .env

cp .env.example .env

ตัวอย่าง .env
# ===========================
# Collector / Ingest
# ===========================
BACKEND_URL=http://backend:4000
HTTP_PORT=8081          # HTTP Ingest port
SYSLOG_PORT=514         # Syslog UDP port

# ===========================
# Backend / API
# ===========================
DB_HOST=mysql           # Docker service name
DB_PORT=3306
DB_USER=logs
DB_PASS=logspass
DB_NAME=logsdb
JWT_SECRET=super_secret_jwt
ALERT_THRESHOLD=5       # สำหรับ alert ตัวอย่าง (ล็อกอินล้มเหลว 5 ครั้ง)
ALERT_TIMEFRAME=5       # นาที
RETENTION_DAYS=7        # กำหนดเก็บ log ขั้นต่ำ 7 วัน

# ===========================
# Frontend / React
# ===========================
VITE_API_URL=http://localhost:4000 # URL ของ backend API

# ===========================
# Optional / Adminer
# ===========================
ADMINER_DEFAULT_USER=logs
ADMINER_DEFAULT_PASS=logspass
ADMINER_DEFAULT_DB=logsdb
ADMINER_DEFAULT_SERVER=mysql


3. รันด้วย Docker Compose

docker-compose up -d

4. ตรวจสอบ Container

docker ps


ควรเห็น services เช่น:

- backend

- frontend

- postgres

- ingest

5. เข้าถึงระบบ

Frontend (Dashboard): http://localhost:3000

Backend API: http://localhost:4000

Ingest API: http://localhost:4000/ingest


6 กรณีที่ Front End (Error)
ตัวอย่าง
> demo-log-frontend@1.0.0 dev 
> vite --port 3000 sh: 1: vite: not found 
sh: 1: vite: not found

วิธีแก้ไข:
1. เพิ่ม vite เข้าไปในโปรเจกต์ของคุณ (บนเครื่องจริงก่อน)
npm install --save-dev @vitejs/plugin-react

2. ลบ node_modules และ package-lock.json เก่าก่อน build ใหม่
-- windows
Remove-Item -Recurse -Force node_modules, package-lock.json
-- Linux/mac
rm -rf node_modules package-lock.json
จากนั้น ก็ติดตั้ง  npm
npm install

3. Build image ใหม่
docker build -t demo-log-frontend .

4. Run container
docker run -it -p 3000:3000 demo-log-frontend





🧹 การหยุดใช้งาน

docker-compose down


หากต้องการลบข้อมูลทั้งหมด (รวม DB)

docker-compose down -v


