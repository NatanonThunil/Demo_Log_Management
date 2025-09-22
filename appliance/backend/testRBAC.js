import axios from "axios";

// API base URL
const BASE_URL = "http://localhost:4000";

// Users
const users = [
  { username: "alice", password: "password123", role: "admin" },
  { username: "bob", password: "password456", role: "viewer" },
];

// ฟังก์ชัน login และเก็บ token
async function loginUser(user) {
  try {
    const res = await axios.post(`${BASE_URL}/login`, {
      username: user.username,
      password: user.password,
    });
    console.log(`${user.username} logged in successfully`);
    return res.data.token;
  } catch (err) {
    console.error(`${user.username} login failed:`, err.response?.data);
    return null;
  }
}

// ฟังก์ชันเรียก API ด้วย token
async function callAPI(token, endpoint) {
  try {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`GET ${endpoint} success:`, res.data.rows?.length ?? res.data);
  } catch (err) {
    console.error(`GET ${endpoint} failed:`, err.response?.status, err.response?.data);
  }
}

async function testRBAC() {
  for (const user of users) {
    const token = await loginUser(user);
    if (!token) continue;

    console.log(`\n=== Testing APIs for ${user.username} (${user.role}) ===`);

    // /logs - ทุกคนเข้าถึงได้ (tenant ของตัวเอง)
    await callAPI(token, "/logs");

    // /alerts - ทุกคนเข้าถึงได้
    await callAPI(token, "/alerts");

    // /admin/logs - admin เท่านั้น
    await callAPI(token, "/admin/logs");

    console.log("\n-------------------------------\n");
  }
}

testRBAC();
