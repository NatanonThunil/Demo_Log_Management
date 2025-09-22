export function filterFieldsByRole(data, role) {
  if(role === "viewer") {
    return data.map(d => ({
      ts: d.ts,
      tenant: d.tenant,
      event_type: d.event_type,
      msg: d.msg
    }));
  }
  return data; // admin เห็นทุก field
}
