/* qrmo — shared QR helpers. No network calls: every payload is built and
   rendered entirely in the visitor's browser. */

const QRMO = (() => {

  /* ---- payload builders: turn a friendly form into the exact string a
     QR reader expects for each content type ---- */

  function escapeVCard(v){
    return String(v || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  }
  function escapeWifi(v){
    return String(v || '').replace(/([\\;,":])/g, '\\$1');
  }

  const payload = {
    link(d){
      let url = (d.url || '').trim();
      if (!url) return '';
      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = 'https://' + url;
      return url;
    },
    text(d){
      return (d.text || '').trim();
    },
    wifi(d){
      const type = d.enc === 'none' ? 'nopass' : (d.enc || 'WPA').toUpperCase();
      const hidden = d.hidden ? 'true' : 'false';
      const pass = d.enc === 'none' ? '' : `P:${escapeWifi(d.pass)};`;
      return `WIFI:T:${type};S:${escapeWifi(d.ssid)};${pass}H:${hidden};;`;
    },
    vcard(d){
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      const name = `${d.last || ''};${d.first || ''};;;`;
      lines.push(`N:${escapeVCard(name)}`);
      lines.push(`FN:${escapeVCard(`${d.first || ''} ${d.last || ''}`.trim())}`);
      if (d.org) lines.push(`ORG:${escapeVCard(d.org)}`);
      if (d.title) lines.push(`TITLE:${escapeVCard(d.title)}`);
      if (d.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(d.phone)}`);
      if (d.email) lines.push(`EMAIL:${escapeVCard(d.email)}`);
      if (d.website) lines.push(`URL:${escapeVCard(d.website)}`);
      if (d.address) lines.push(`ADR:;;${escapeVCard(d.address)};;;;`);
      lines.push('END:VCARD');
      return lines.join('\n');
    },
    email(d){
      const params = new URLSearchParams();
      if (d.subject) params.set('subject', d.subject);
      if (d.body) params.set('body', d.body);
      const qs = params.toString();
      return `mailto:${(d.to || '').trim()}${qs ? '?' + qs : ''}`;
    },
    phone(d){
      return `tel:${(d.phone || '').trim()}`;
    },
    sms(d){
      const num = (d.phone || '').trim();
      return d.message ? `SMSTO:${num}:${d.message}` : `SMSTO:${num}:`;
    },
    location(d){
      const lat = (d.lat || '').trim();
      const lng = (d.lng || '').trim();
      return `geo:${lat},${lng}`;
    }
  };

  function buildPayload(type, data){
    return (payload[type] || payload.text)(data || {});
  }

  /* ---- qr-code-styling wrapper ---- */

  /* dots/corners take either a flat `color` or a `gradient` object — never
     both — so this picks exactly one shape based on whether a gradient is
     turned on, and every section (dots, corner border, corner center)
     reuses it for one cohesive look. */
  function fillShape(opts){
    if (opts.gradient && opts.gradient.enabled){
      return {
        gradient: {
          type: opts.gradient.type === 'radial' ? 'radial' : 'linear',
          rotation: opts.gradient.type === 'radial' ? 0 : (Number(opts.gradient.rotation) || 0),
          colorStops: [
            { offset: 0, color: opts.fg || '#17171f' },
            { offset: 1, color: opts.gradient.color2 || '#3a4eff' }
          ]
        }
      };
    }
    return { color: opts.fg || '#17171f' };
  }

  function qrOptionShape(opts){
    const fill = fillShape(opts);
    return {
      width: opts.size || 300,
      height: opts.size || 300,
      data: opts.data || ' ',
      margin: 10,
      qrOptions: { errorCorrectionLevel: opts.ecLevel || 'M' },
      dotsOptions: { type: opts.dotStyle || 'square', ...fill },
      cornersSquareOptions: { type: opts.cornerStyle || 'square', ...fill },
      cornersDotOptions: { type: opts.cornerDotStyle || 'square', ...fill },
      backgroundOptions: { color: opts.transparent ? 'rgba(0,0,0,0)' : (opts.bg || '#ffffff') },
      image: opts.logo || undefined,
      imageOptions: { crossOrigin: 'anonymous', margin: 6, imageSize: 0.4 }
    };
  }

  function createQR(opts, type){
    return new QRCodeStyling({ type: type || 'canvas', ...qrOptionShape(opts) });
  }

  function updateQR(instance, opts){
    instance.update(qrOptionShape(opts));
  }

  function download(qr, name, extension){
    qr.download({ name: name || 'qrmo', extension: extension || 'png' });
  }

  /* download as svg needs a dedicated svg-type instance — the library
     keeps one rendering backend per instance */
  function downloadAsSvg(opts, name){
    const svgQr = createQR(opts, 'svg');
    svgQr.download({ name: name || 'qrmo', extension: 'svg' });
  }

  /* ---- readability checks: contrast math + an actual decode round-trip ---- */

  function hexToRgb(hex){
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }
  function relLuminance({ r, g, b }){
    const chan = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  }
  function contrastRatio(hex1, hex2){
    const L1 = relLuminance(hexToRgb(hex1));
    const L2 = relLuminance(hexToRgb(hex2));
    const lighter = Math.max(L1, L2), darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /* Decodes the actually-rendered canvas with jsQR and checks it round-trips
     back to the exact payload — catches real-world failures (logo too big,
     error correction too low) that a contrast check alone would miss.
     Returns null (skip) if jsQR isn't loaded on this page. */
  function verifyReadable(canvas, expectedData){
    if (typeof jsQR !== 'function' || !canvas) return null;
    try{
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      return !!(code && code.data === expectedData);
    }catch(e){ return null; }
  }

  function readFileAsDataURL(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return { buildPayload, createQR, updateQR, download, downloadAsSvg, readFileAsDataURL, contrastRatio, verifyReadable };
})();
