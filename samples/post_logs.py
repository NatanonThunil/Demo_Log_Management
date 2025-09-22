#!/usr/bin/env python3
# ส่ง log ผ่าน HTTP POST (JSON) ไปยัง /ingest
import requests
import json

API_URL = "http://localhost:4000/ingest"
TOKEN = "YOUR_JWT_TOKEN_HERE"  # ใส่ token หลัง login

logs = [
    {
        "ts": "2025-09-22 08:12:01",
        "tenant": "demoA",
        "event_type": "login_success",
        "src_ip": "192.168.1.10",
        "dst_ip": None,
        "user": "alice",
        "severity": 3,
        "msg": "Login successful",
        "raw": {}
    },
    {
        "ts": "2025-09-22 08:14:05",
        "tenant": "demoA",
        "event_type": "login_failed",
        "src_ip": "203.0.113.5",
        "dst_ip": None,
        "user": "bob",
        "severity": 5,
        "msg": "Login failed",
        "raw": {}
    },
    {
        "ts": "2025-09-22 08:15:12",
        "tenant": "demoB",
        "event_type": "unauthorized_access",
        "src_ip": "10.0.0.12",
        "dst_ip": None,
        "user": "eve",
        "severity": 8,
        "msg": "Unauthorized access",
        "raw": {}
    }
]

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

for log in logs:
    response = requests.post(API_URL, headers=headers, data=json.dumps(log))
    if response.ok:
        print(f"Sent log: {log['event_type']}")
    else:
        print(f"Failed: {response.text}")


# วิธีใช้:

# python3 post_logs.py