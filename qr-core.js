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

  function qrOptionShape(opts){
    return {
      width: opts.size || 300,
      height: opts.size || 300,
      data: opts.data || ' ',
      margin: 10,
      qrOptions: { errorCorrectionLevel: opts.ecLevel || 'M' },
      dotsOptions: { color: opts.fg || '#17171f', type: opts.dotStyle || 'square' },
      cornersSquareOptions: { color: opts.fg || '#17171f', type: opts.cornerStyle || 'square' },
      cornersDotOptions: { color: opts.fg || '#17171f' },
      backgroundOptions: { color: opts.bg || '#ffffff' },
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

  function readFileAsDataURL(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return { buildPayload, createQR, updateQR, download, downloadAsSvg, readFileAsDataURL };
})();
