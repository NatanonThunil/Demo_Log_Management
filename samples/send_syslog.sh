#!/bin/bash
# ส่ง log ไปยัง Syslog UDP 514 ของ backend
# ต้องติดตั้ง netcat (nc)

SYSLOG_SERVER="127.0.0.1"
SYSLOG_PORT=514
LOG_FILE="./log_example.log"

while IFS= read -r line
do
    echo "$line" | nc -w 1 -u $SYSLOG_SERVER $SYSLOG_PORT
    echo "Sent: $line"
done < "$LOG_FILE"


# วิธีใช้:
# chmod +x send_syslog.sh
# ./send_syslog.sh
