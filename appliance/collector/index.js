const dgram = require('dgram');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');
const normalizer = require('./normalizer');
const enrichment = require('./enrichment');

const SYSLOG_PORT = process.env.SYSLOG_PORT || 514;
const HTTP_PORT = process.env.HTTP_PORT || 8081;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const server = dgram.createSocket('udp4');
server.on('error', (err) => console.error('syslog error', err));
server.on('message', async (msg, rinfo) => {
  const raw = msg.toString();
  const normalized = normalizer.fromSyslog(raw, rinfo);
  const enriched = enrichment.enrich(normalized);
  try { await axios.post(`${BACKEND_URL}/ingest`, enriched); } 
  catch(e){ console.error('send to backend fail', e.message); }
});
server.bind(SYSLOG_PORT);
console.log('Syslog UDP listener bound to', SYSLOG_PORT);

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));

app.post('/ingest-json', async (req, res) => {
  try {
    const normalized = normalizer.fromHttpJson(req.body, req.headers);
    const enriched = enrichment.enrich(normalized);
    await axios.post(`${BACKEND_URL}/ingest`, enriched);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ ok: false, error: e.message }); }
});

const upload = multer();
app.post('/ingest-file', upload.single('file'), async (req, res) => {
  const lines = req.file.buffer.toString().split(/\r?\n/).filter(Boolean);
  for (const l of lines) {
    try {
      const parsed = JSON.parse(l);
      const normalized = normalizer.fromHttpJson(parsed, req.headers);
      const enriched = enrichment.enrich(normalized);
      await axios.post(`${BACKEND_URL}/ingest`, enriched);
    } catch (e) { console.error('failed line', e.message); }
  }
  res.json({ ok: true, count: lines.length });
});

app.listen(HTTP_PORT, () => console.log('Collector HTTP listening', HTTP_PORT));
