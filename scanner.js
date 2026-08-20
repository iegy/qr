// qrmo — mobile-first QR scanner.
// v2.0.2: high-resolution center scan + full-frame fallback + BarcodeDetector + jsQR.
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const placeholder = document.getElementById('videoPlaceholder');
  const viewfinder = document.getElementById('viewfinder');
  const canvas = document.getElementById('captureCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const torchBtn = document.getElementById('torchBtn');
  const camHint = document.getElementById('camHint');
  const imgInput = document.getElementById('imgInput');

  const resultBox = document.getElementById('scanResult');
  const resultType = document.getElementById('resultType');
  const resultFields = document.getElementById('resultFields');
  const resultRaw = document.getElementById('resultRaw');
  const resultActions = document.getElementById('resultActions');

  const historyWrap = document.getElementById('historyWrap');
  const historyList = document.getElementById('historyList');
  const exportHistoryBtn = document.getElementById('exportHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  const HISTORY_KEY = 'qrmo-scan-history-v2';
  const HISTORY_MAX = 50;
  const SCAN_INTERVAL = 150; // ~6-7 scans/sec; good balance on mobile.
  const CENTER_MAX_SIDE = 1150;
  const FULL_MAX_SIDE = 1400;
  const CENTER_CROP_RATIO = 0.82;
  const FULL_SCAN_EVERY = 3;

  let stream = null;
  let scanTimer = null;
  let scanBusy = false;
  let scanCounter = 0;
  let cameraStartedAt = 0;
  let lastText = null;
  let lastAt = 0;
  let lastShownText = null;
  let detector = null;
  let detectorReady = false;
  let torchOn = false;
  let activeTrack = null;

  const loadHistory = () => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch (e) { return []; }
  };
  const saveHistory = (items) => localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_MAX)));
  let history = loadHistory();

  function interpret(text) {
    const t = QRMO_I18N.t;
    if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(text)) {
      return { badge: t('scan.badge.whatsapp'), fields: {}, actions: [{ label: t('scan.action.openWhatsapp'), href: text }] };
    }
    if (/^https?:\/\//i.test(text)) {
      return { badge: t('scan.badge.link'), fields: {}, actions: [{ label: t('scan.action.openLink'), href: text }] };
    }
    if (/^BEGIN:VEVENT/i.test(text)) {
      const line = (k) => (text.match(new RegExp('^' + k + ':(.*)$', 'im')) || [])[1] || '';
      return {
        badge: t('scan.badge.event'),
        fields: {
          [t('scan.field.title')]: line('SUMMARY') || t('scan.na'),
          [t('scan.field.location')]: line('LOCATION') || t('scan.na')
        },
        actions: []
      };
    }
    if (/^WIFI:/i.test(text)) {
      const get = (k) => (text.match(new RegExp(k + ':((?:[^\\\\;]|\\\\.)*)')) || [])[1];
      const clean = (v) => (v || '').replace(/\\(.)/g, '$1');
      return {
        badge: t('scan.badge.wifi'),
        fields: {
          [t('scan.field.ssid')]: clean(get('S')) || t('scan.na'),
          [t('scan.field.pass')]: clean(get('P')) || t('scan.na'),
          [t('scan.field.enc')]: clean(get('T')) || t('scan.na')
        },
        actions: []
      };
    }
    if (/^BEGIN:VCARD/i.test(text)) {
      const line = (k) => (text.match(new RegExp('^' + k + '[^:]*:(.*)$', 'im')) || [])[1] || '';
      return {
        badge: t('scan.badge.vcard'),
        fields: {
          [t('scan.field.name')]: line('FN') || t('scan.na'),
          [t('scan.field.tel')]: line('TEL') || t('scan.na'),
          [t('scan.field.email')]: line('EMAIL') || t('scan.na'),
          [t('scan.field.org')]: line('ORG') || t('scan.na')
        },
        actions: []
      };
    }
    if (/^mailto:/i.test(text)) {
      const addr = text.replace(/^mailto:/i, '').split('?')[0];
      return { badge: t('scan.badge.email'), fields: { [t('scan.field.email')]: addr || t('scan.na') }, actions: [{ label: t('scan.action.sendEmail'), href: text }] };
    }
    if (/^tel:/i.test(text)) {
      const num = text.replace(/^tel:/i, '');
      return { badge: t('scan.badge.tel'), fields: { [t('scan.field.tel')]: num }, actions: [{ label: t('scan.action.call'), href: text }] };
    }
    if (/^SMSTO:/i.test(text)) {
      const [, num, msg] = text.match(/^SMSTO:([^:]*):?(.*)$/i) || [];
      return { badge: t('scan.badge.sms'), fields: { [t('scan.field.smsNum')]: num || t('scan.na'), [t('scan.field.smsMsg')]: msg || t('scan.na') }, actions: [] };
    }
    if (/^geo:/i.test(text)) {
      const coords = text.replace(/^geo:/i, '');
      return { badge: t('scan.badge.geo'), fields: { [t('scan.field.coords')]: coords }, actions: [{ label: t('scan.action.openMaps'), href: `https://maps.google.com/?q=${encodeURIComponent(coords)}` }] };
    }
    return { badge: t('scan.badge.text'), fields: {}, actions: [] };
  }

  function displayResult(text) {
    lastShownText = text;
    const info = interpret(text);
    resultType.textContent = info.badge;
    resultFields.innerHTML = '';
    Object.entries(info.fields).forEach(([k, v]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = k;
      dd.textContent = v;
      resultFields.append(dt, dd);
    });
    resultRaw.textContent = text;
    resultActions.innerHTML = '';
    info.actions.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.className = 'btn btn-primary';
      link.textContent = a.label;
      resultActions.appendChild(link);
    });
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-ghost-dark';
    copyBtn.type = 'button';
    copyBtn.textContent = QRMO_I18N.t('scan.copy');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = QRMO_I18N.t('scan.copied');
        setTimeout(() => { copyBtn.textContent = QRMO_I18N.t('scan.copy'); }, 1500);
      } catch (e) {}
    });
    resultActions.appendChild(copyBtn);
    resultBox.hidden = false;
  }

  function showResult(text) {
    displayResult(text);
    const info = interpret(text);
    history.unshift({ text, badge: info.badge, at: Date.now() });
    history = history.slice(0, HISTORY_MAX);
    saveHistory(history);
    renderHistory();
    camHint.textContent = QRMO_I18N.t('scan.hint.found');
  }

  function renderHistory() {
    historyWrap.hidden = !history.length;
    historyList.innerHTML = '';
    history.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('span');
      const b = document.createElement('span');
      a.textContent = interpret(item.text).badge;
      b.className = 'mono';
      b.textContent = item.text;
      li.append(a, b);
      li.addEventListener('click', () => displayResult(item.text));
      historyList.appendChild(li);
    });
  }

  exportHistoryBtn.addEventListener('click', () => {
    if (!history.length) return;
    const rows = [['type', 'text', 'scanned_at'], ...history.map((i) => [interpret(i.text).badge, i.text, new Date(i.at).toISOString()])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrmo-scan-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    saveHistory(history);
    renderHistory();
  });

  document.addEventListener('qrmo:langchange', () => {
    renderHistory();
    if (!resultBox.hidden && lastShownText !== null) displayResult(lastShownText);
    if (stream && !lastShownText) camHint.textContent = QRMO_I18N.t('scan.hint.scanning');
  });

  async function initNativeDetector() {
    detectorReady = true;
    if (!('BarcodeDetector' in window)) return;
    try {
      if (typeof BarcodeDetector.getSupportedFormats === 'function') {
        const formats = await BarcodeDetector.getSupportedFormats();
        if (Array.isArray(formats) && !formats.includes('qr_code')) return;
      }
      detector = new BarcodeDetector({ formats: ['qr_code'] });
    } catch (e) {
      detector = null;
    }
  }

  // Draw either the high-resolution center area (what the user sees in the
  // viewfinder) or the complete frame into our hidden decoding canvas.
  function drawFrame(source, width, height, mode, maxSide) {
    if (!width || !height) return null;

    let sx = 0, sy = 0, sw = width, sh = height;
    if (mode === 'center') {
      const side = Math.max(1, Math.min(width, height) * CENTER_CROP_RATIO);
      sx = (width - side) / 2;
      sy = (height - side) / 2;
      sw = side;
      sh = side;
    }

    const scale = Math.min(1, maxSide / Math.max(sw, sh));
    const dw = Math.max(1, Math.round(sw * scale));
    const dh = Math.max(1, Math.round(sh * scale));
    canvas.width = dw;
    canvas.height = dh;
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
    return { width: dw, height: dh };
  }

  async function decodeCurrentCanvas() {
    // Native detector is fast and very reliable on supported Android/Chromium devices.
    if (detector) {
      try {
        const codes = await detector.detect(canvas);
        const value = codes && codes[0] && codes[0].rawValue;
        if (value) return value;
      } catch (e) {
        // Some browsers expose BarcodeDetector but reject canvas input; jsQR remains the fallback.
      }
    }

    if (typeof window.jsQR === 'function') {
      try {
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });
        return code && code.data ? code.data : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async function scanVideoFrame() {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;

    // First: scan the viewfinder area at higher effective resolution. This is
    // the key mobile fix — small QR modules are no longer destroyed by scaling
    // the whole camera frame down before decoding.
    if (drawFrame(video, w, h, 'center', CENTER_MAX_SIDE)) {
      const centered = await decodeCurrentCanvas();
      if (centered) return centered;
    }

    // Second: every few passes scan the full frame too, so a QR slightly outside
    // the viewfinder can still be found without doubling CPU use every cycle.
    if (scanCounter % FULL_SCAN_EVERY === 0 && drawFrame(video, w, h, 'full', FULL_MAX_SIDE)) {
      const full = await decodeCurrentCanvas();
      if (full) return full;
    }
    return null;
  }

  async function applyCameraEnhancements(track) {
    if (!track || typeof track.getCapabilities !== 'function') return;
    try {
      const caps = track.getCapabilities() || {};
      const advanced = {};
      if (Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) advanced.focusMode = 'continuous';
      if (Array.isArray(caps.exposureMode) && caps.exposureMode.includes('continuous')) advanced.exposureMode = 'continuous';
      if (Array.isArray(caps.whiteBalanceMode) && caps.whiteBalanceMode.includes('continuous')) advanced.whiteBalanceMode = 'continuous';
      if (Object.keys(advanced).length) {
        try { await track.applyConstraints({ advanced: [advanced] }); } catch (e) {}
      }
      if (torchBtn && caps.torch) torchBtn.hidden = false;
    } catch (e) {}
  }

  async function getRearCameraStream() {
    const highQuality = {
      audio: false,
      video: {
        facingMode: { exact: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 30 }
      }
    };
    const compatible = {
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    try {
      return await navigator.mediaDevices.getUserMedia(highQuality);
    } catch (firstError) {
      return navigator.mediaDevices.getUserMedia(compatible);
    }
  }

  async function startCamera() {
    camHint.textContent = '';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      camHint.textContent = QRMO_I18N.t('scan.err.camera');
      return;
    }

    try {
      stream = await getRearCameraStream();
    } catch (err) {
      camHint.textContent = QRMO_I18N.t('scan.err.camera');
      return;
    }

    if (!detectorReady) await initNativeDetector();

    activeTrack = stream.getVideoTracks()[0] || null;
    await applyCameraEnhancements(activeTrack);

    video.srcObject = stream;
    video.hidden = false;
    placeholder.hidden = true;
    viewfinder.hidden = false;

    try {
      await video.play();
    } catch (err) {
      stopCamera();
      camHint.textContent = QRMO_I18N.t('scan.err.camera');
      return;
    }

    startBtn.hidden = true;
    stopBtn.hidden = false;
    scanCounter = 0;
    cameraStartedAt = Date.now();
    camHint.textContent = QRMO_I18N.t('scan.hint.scanning');

    if (!detector && typeof window.jsQR !== 'function') {
      camHint.textContent = QRMO_I18N.t('scan.err.decoder');
      return;
    }

    scheduleNextScan(0);
  }

  function scheduleNextScan(delay = SCAN_INTERVAL) {
    clearTimeout(scanTimer);
    if (!stream) return;
    scanTimer = setTimeout(scanLoop, delay);
  }

  async function scanLoop() {
    if (!stream) return;
    if (scanBusy) {
      scheduleNextScan();
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
      scanBusy = true;
      scanCounter += 1;
      try {
        const value = await scanVideoFrame();
        if (value) {
          const now = Date.now();
          if (value !== lastText || now - lastAt > 2500) {
            lastText = value;
            lastAt = now;
            showResult(value);
            if (navigator.vibrate) navigator.vibrate(35);
          }
        } else if (Date.now() - cameraStartedAt > 3000 && !lastShownText) {
          camHint.textContent = QRMO_I18N.t('scan.hint.move');
        }
      } finally {
        scanBusy = false;
      }
    }
    scheduleNextScan();
  }

  function stopCamera() {
    clearTimeout(scanTimer);
    scanTimer = null;
    scanBusy = false;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    activeTrack = null;
    torchOn = false;
    if (torchBtn) {
      torchBtn.hidden = true;
      torchBtn.setAttribute('aria-pressed', 'false');
      torchBtn.textContent = QRMO_I18N.t('scan.torch.on');
    }
    video.srcObject = null;
    video.hidden = true;
    placeholder.hidden = false;
    viewfinder.hidden = true;
    startBtn.hidden = false;
    stopBtn.hidden = true;
    camHint.textContent = '';
  }

  async function toggleTorch() {
    if (!activeTrack || !torchBtn) return;
    torchOn = !torchOn;
    try {
      await activeTrack.applyConstraints({ advanced: [{ torch: torchOn }] });
      torchBtn.setAttribute('aria-pressed', torchOn ? 'true' : 'false');
      torchBtn.textContent = QRMO_I18N.t(torchOn ? 'scan.torch.off' : 'scan.torch.on');
    } catch (e) {
      torchOn = false;
      torchBtn.hidden = true;
    }
  }

  startBtn.addEventListener('click', startCamera);
  stopBtn.addEventListener('click', stopCamera);
  if (torchBtn) torchBtn.addEventListener('click', toggleTorch);
  window.addEventListener('pagehide', stopCamera);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && stream) stopCamera();
  });

  async function decodeUploadedImage(img) {
    const attempts = [
      ['full', 1900],
      ['center', 1600]
    ];
    for (const [mode, maxSide] of attempts) {
      if (!drawFrame(img, img.naturalWidth, img.naturalHeight, mode, maxSide)) continue;
      const value = await decodeCurrentCanvas();
      if (value) return value;
    }
    return null;
  }

  imgInput.addEventListener('change', () => {
    const file = imgInput.files[0];
    if (!file) return;
    camHint.textContent = '';
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      if (!detectorReady) await initNativeDetector();
      const value = await decodeUploadedImage(img);
      if (value) showResult(value);
      else if (!detector && typeof window.jsQR !== 'function') camHint.textContent = QRMO_I18N.t('scan.err.decoder');
      else camHint.textContent = QRMO_I18N.t('scan.err.noCode');
      URL.revokeObjectURL(url);
      imgInput.value = '';
    };
    img.onerror = () => {
      camHint.textContent = QRMO_I18N.t('scan.err.noCode');
      URL.revokeObjectURL(url);
      imgInput.value = '';
    };
    img.src = url;
  });

  // Prepare native detector in the background; no permission is requested here.
  initNativeDetector();
  renderHistory();
});
