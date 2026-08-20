/* qrmo — shared QR helpers. Everything is rendered locally in the browser. */
const QRMO = (() => {
  function escapeVCard(v){
    return String(v || '').replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');
  }
  function escapeWifi(v){
    return String(v || '').replace(/([\\;,":])/g, '\\$1');
  }
  function escapeEvent(v){
    return String(v || '').replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');
  }
  function normalizeUrl(value){
    let url = String(value || '').trim();
    if (!url) return '';
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }
  function cleanPhone(v){ return String(v || '').trim().replace(/[^\d+]/g, ''); }
  function eventDate(v){
    const raw = String(v || '').trim();
    if (!raw) return '';
    return raw.replace(/[-:]/g, '').replace(/\.\d+$/, '').replace(/Z$/i, 'Z').replace('T', 'T') + (raw.length <= 16 ? '00' : '');
  }

  const payload = {
    link(d){ return normalizeUrl(d.url); },
    text(d){ return String(d.text || '').trim(); },
    wifi(d){
      const type = d.enc === 'none' ? 'nopass' : String(d.enc || 'WPA').toUpperCase();
      const hidden = d.hidden ? 'true' : 'false';
      const pass = d.enc === 'none' ? '' : `P:${escapeWifi(d.pass)};`;
      return `WIFI:T:${type};S:${escapeWifi(d.ssid)};${pass}H:${hidden};;`;
    },
    vcard(d){
      const first = escapeVCard(d.first);
      const last = escapeVCard(d.last);
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      // Keep vCard component separators unescaped; escape only user data.
      lines.push(`N:${last};${first};;;`);
      lines.push(`FN:${escapeVCard(`${d.first || ''} ${d.last || ''}`.trim())}`);
      if (d.org) lines.push(`ORG:${escapeVCard(d.org)}`);
      if (d.title) lines.push(`TITLE:${escapeVCard(d.title)}`);
      if (d.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(d.phone)}`);
      if (d.email) lines.push(`EMAIL:${escapeVCard(d.email)}`);
      if (d.website) lines.push(`URL:${escapeVCard(normalizeUrl(d.website))}`);
      if (d.address) lines.push(`ADR:;;${escapeVCard(d.address)};;;;`);
      lines.push('END:VCARD');
      return lines.join('\n');
    },
    email(d){
      const params = new URLSearchParams();
      if (d.subject) params.set('subject', d.subject);
      if (d.body) params.set('body', d.body);
      const qs = params.toString();
      return `mailto:${String(d.to || '').trim()}${qs ? '?' + qs : ''}`;
    },
    phone(d){ return `tel:${String(d.phone || '').trim()}`; },
    sms(d){
      const num = String(d.phone || '').trim();
      return d.message ? `SMSTO:${num}:${d.message}` : `SMSTO:${num}:`;
    },
    location(d){
      const lat = String(d.lat || '').trim();
      const lng = String(d.lng || '').trim();
      return lat && lng ? `geo:${lat},${lng}` : '';
    },
    whatsapp(d){
      const phone = cleanPhone(d.phone).replace(/^\+/, '');
      if (!phone) return '';
      const text = String(d.message || '').trim();
      return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    },
    event(d){
      const start = eventDate(d.start);
      if (!start) return '';
      const lines = ['BEGIN:VEVENT'];
      if (d.title) lines.push(`SUMMARY:${escapeEvent(d.title)}`);
      lines.push(`DTSTART:${start}`);
      if (d.end) lines.push(`DTEND:${eventDate(d.end)}`);
      if (d.location) lines.push(`LOCATION:${escapeEvent(d.location)}`);
      if (d.description) lines.push(`DESCRIPTION:${escapeEvent(d.description)}`);
      lines.push('END:VEVENT');
      return lines.join('\n');
    },
    social(d){ return normalizeUrl(d.url); },
    review(d){ return normalizeUrl(d.url); }
  };

  function buildPayload(type, data){ return (payload[type] || payload.text)(data || {}); }

  function fillShape(opts){
    if (opts.gradient && opts.gradient.enabled){
      return { gradient: {
        type: opts.gradient.type === 'radial' ? 'radial' : 'linear',
        rotation: opts.gradient.type === 'radial' ? 0 : (Number(opts.gradient.rotation) || 0),
        colorStops: [
          { offset: 0, color: opts.fg || '#211E1A' },
          { offset: 1, color: opts.gradient.color2 || '#E4894B' }
        ]
      }};
    }
    return { color: opts.fg || '#211E1A' };
  }

  function qrOptionShape(opts){
    const fill = fillShape(opts);
    return {
      width: opts.size || 300,
      height: opts.size || 300,
      data: opts.data || ' ',
      margin: Number.isFinite(opts.margin) ? opts.margin : 10,
      qrOptions: { errorCorrectionLevel: opts.ecLevel || 'M' },
      dotsOptions: { type: opts.dotStyle || 'square', ...fill },
      cornersSquareOptions: { type: opts.cornerStyle || 'square', ...fill },
      cornersDotOptions: { type: opts.cornerDotStyle || 'square', ...fill },
      backgroundOptions: { color: opts.transparent ? 'rgba(0,0,0,0)' : (opts.bg || '#ffffff') },
      image: opts.logo || undefined,
      imageOptions: { crossOrigin: 'anonymous', margin: 6, imageSize: Math.min(.42, Math.max(.18, Number(opts.logoSize) || .36)) }
    };
  }

  function createQR(opts, type){ return new QRCodeStyling({ type: type || 'canvas', ...qrOptionShape(opts) }); }
  function updateQR(instance, opts){ instance.update(qrOptionShape(opts)); }
  function download(qr, name, extension){ qr.download({ name: name || 'qrmo', extension: extension || 'png' }); }
  function downloadAsSvg(opts, name){ createQR(opts, 'svg').download({ name: name || 'qrmo', extension: 'svg' }); }

  function hexToRgb(hex){
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return { r:0, g:0, b:0 };
    return { r:parseInt(m[1],16), g:parseInt(m[2],16), b:parseInt(m[3],16) };
  }
  function relLuminance({r,g,b}){
    const chan = (v) => { v/=255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4); };
    return .2126*chan(r)+.7152*chan(g)+.0722*chan(b);
  }
  function contrastRatio(hex1, hex2){
    const a=relLuminance(hexToRgb(hex1)), b=relLuminance(hexToRgb(hex2));
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  }
  function verifyReadable(canvas, expectedData){
    if (typeof jsQR !== 'function' || !canvas) return null;
    try{
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      const img=ctx.getImageData(0,0,canvas.width,canvas.height);
      const code=jsQR(img.data,img.width,img.height,{ inversionAttempts:'attemptBoth' });
      return !!(code && code.data === expectedData);
    }catch(e){ return null; }
  }

  function healthScore(opts, readable){
    const bg = opts.transparent ? '#ffffff' : (opts.bg || '#ffffff');
    const c1 = contrastRatio(opts.fg || '#211E1A', bg);
    const c2 = opts.gradient?.enabled ? contrastRatio(opts.gradient.color2 || '#E4894B', bg) : c1;
    const contrast = Math.min(c1,c2);
    let score = 45;
    const notes = [];
    if (contrast >= 7) score += 24;
    else if (contrast >= 4.5) score += 20;
    else if (contrast >= 3) { score += 12; notes.push('contrast'); }
    else if (contrast >= 2.2) { score += 4; notes.push('contrast'); }
    else { score -= 20; notes.push('contrast'); }

    const len = String(opts.data || '').length;
    if (len <= 120) score += 10;
    else if (len <= 450) score += 6;
    else if (len > 900) { score -= 8; notes.push('density'); }

    if ((opts.size || 300) >= 280) score += 4;
    if (opts.logo){
      if (opts.ecLevel === 'H') score += 5;
      else { score -= 10; notes.push('logo'); }
    }
    if (opts.gradient?.enabled && contrast < 4.5) { score -= 3; notes.push('gradient'); }
    if (readable === true) score += 12;
    if (readable === false) { score -= 35; notes.push('scan'); }
    score = Math.max(0, Math.min(100, Math.round(score)));
    const level = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 55 ? 'fair' : 'poor';
    return { score, level, contrast, notes:[...new Set(notes)] };
  }

  function readFileAsDataURL(file){
    return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
  }

  return { buildPayload, createQR, updateQR, download, downloadAsSvg, readFileAsDataURL, contrastRatio, verifyReadable, healthScore, normalizeUrl };
})();
