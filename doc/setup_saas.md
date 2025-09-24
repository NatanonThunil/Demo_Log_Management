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
- ติดตั้ง ngrok ใส่ token ของคุณ (ครั้งเดียวพอ)

---

## 📦 ขั้นตอนการติดตั้ง

### 1. เตรียมเซิร์ฟเวอร์
## อย่าลืมติดตั้ง Docker และ ติดตั้ง ngrok ก่อน


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


5. แชร์ผ่าน ngrok

```bash
แชร์ผ่าน ngrok

ngrok http 3000 (ตาม host frontEnd)

จะได้ output แบบนี้:
Forwarding    https://1234abcd.ngrok-free.app -> http://localhost:8080
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
ถ้าอยากให้ ngrok รันใน container ด้วย → ใช้ไฟล์แบบนี้
version: "3.8"
services:
  demo-app:
    image: nginx:latest
    container_name: demo-app
    ports:
      - "8080:80"

  ngrok:
    image: wernight/ngrok
    container_name: ngrok
    command: http demo-app:80
    environment:
      - NGROK_AUTH=<YOUR_AUTH_TOKEN> 
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
จากนั้นรัน

docker compose up -d

จากนั้นรัน

ngrok http 3000

คุณจะเห็น public URL ของ ngrok เลย



************************************************************************************
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

**********************************************************************************************************


🌐 การเข้าถึงระบบ

Frontend Dashboard: https://teagan-oosporic-singly.ngrok-free.dev
