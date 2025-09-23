```markdown
# การติดตั้งระบบ (SaaS/Cloud Mode)

โหมด SaaS เหมาะสำหรับการรันระบบบน **Cloud Public Provider** เช่น AWS, GCP, Azure  
รองรับ multi-tenant, HTTPS (TLS) และ scaling ได้ดีกว่า Appliance

---

## 🛠 ความต้องการ (Prerequisites)
- มี VM/Container บน Cloud (เช่น AWS EC2 t3.medium ขึ้นไป)
- Domain name (เช่น `siem-demo.yourcompany.com`)
- ติดตั้ง **Docker** และ **Docker Compose**
- มี DNS ชี้มาที่ public IP ของ VM
- แนะนำติดตั้ง **NGINX + Let's Encrypt** (รองรับ HTTPS)

---

## 📦 ขั้นตอนการติดตั้ง

### 1. เตรียมเซิร์ฟเวอร์
## อย่าลืมติดตั้ง Docker ก่อน
```bash
sudo apt update && sudo apt install -y docker.io docker-compose


2. Clone Repository

git clone https://github.com/NatanonThunil/Demo_Log_Management.git
cd Demo_Log_Management


3. ตั้งค่า .env
cp .env.example .env

.env
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


4. รัน Service

docker-compose up -d


5. ตั้งค่า Reverse Proxy + HTTPS

ใช้ NGINX + Certbot ตัวอย่าง config:
ตัวอย่าง 

server {
    listen 80;
    server_name siem-demo.yourcompany.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}


sudo certbot --nginx -d siem-demo.yourcompany.com

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



🌐 การเข้าถึงระบบ

Frontend Dashboard: https://siem-demo.yourcompany.com

Backend API: https://siem-demo.yourcompany.com/api

Ingest API: https://siem-demo.yourcompany.com/ingest