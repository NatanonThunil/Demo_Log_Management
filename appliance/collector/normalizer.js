module.exports = {
  fromSyslog(raw, rinfo){
    const ts = new Date().toISOString();
    let msg = raw;
    const parts = raw.split(':');
    if(parts.length>1) msg = parts.slice(1).join(':').trim();
    return {
      ts, tenant:'default',
      event_type: guessEventType(msg),
      src_ip: rinfo.address,
      dst_ip: null, user: null, severity:'info', msg, raw
    };
  },
  fromHttpJson(obj, headers){
    const ts = obj.ts || new Date().toISOString();
    const tenant = headers['x-tenant'] || obj.tenant || 'default';
    return {
      ts, tenant,
      event_type: obj.event_type || guessEventType(obj.msg || obj.message || ''),
      src_ip: obj.src_ip || obj.ip || headers['x-forwarded-for'] || null,
      dst_ip: obj.dst_ip || null,
      user: obj.user || null,
      severity: obj.severity || 'info',
      msg: obj.msg || obj.message || JSON.stringify(obj),
      raw: JSON.stringify(obj)
    };
  }
};

function guessEventType(msg){
  const m = String(msg).toLowerCase();
  if(m.includes('failed login') || m.includes('login failed')) return 'auth_failure';
  if(m.includes('login') && m.includes('success')) return 'auth_success';
  if(m.includes('error')) return 'error';
  return 'event';
}
