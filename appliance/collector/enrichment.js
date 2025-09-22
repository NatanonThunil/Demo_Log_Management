const geoip = require('geoip-lite');
module.exports = {
  enrich(evt){
    if(evt.src_ip){
      const geo = geoip.lookup(evt.src_ip);
      if(geo) evt.geo={country:geo.country,region:geo.region,city:geo.city,ll:geo.ll};
    }
    return evt;
  }
};
