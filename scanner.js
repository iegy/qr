// qrmo — QR scanner: camera loop + image upload, both fully client-side.
document.addEventListener('DOMContentLoaded', () => {

  const video = document.getElementById('video');
  const placeholder = document.getElementById('videoPlaceholder');
  const viewfinder = document.getElementById('viewfinder');
  const canvas = document.getElementById('captureCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
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

  const HISTORY_KEY = 'qrmo-scan-history';
  const HISTORY_MAX = 25;

  let stream = null, rafId = null, lastText = null, lastAt = 0, lastShownText = null;

  function loadHistory(){
    try{ return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch(e){ return []; }
  }
  function saveHistory(items){
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_MAX)));
  }
  let history = loadHistory();

  /* ---- interpret decoded text into a friendly summary (labels are re-read
     live from the i18n dictionary, so a language switch updates them too) ---- */
  function interpret(text){
    const t = QRMO_I18N.t;
    if (/^https?:\/\//i.test(text)){
      return { badge: t('scan.badge.link'), fields: {}, actions: [{ label: t('scan.action.openLink'), href: text }] };
    }
    if (/^WIFI:/i.test(text)){
      const get = (k) => (text.match(new RegExp(k + ':((?:[^\\\\;]|\\\\.)*)')) || [])[1];
      const clean = (v) => (v || '').replace(/\\(.)/g, '$1');
      return { badge: t('scan.badge.wifi'), fields: {
        [t('scan.field.ssid')]: clean(get('S')) || t('scan.na'),
        [t('scan.field.pass')]: clean(get('P')) || t('scan.na'),
        [t('scan.field.enc')]: clean(get('T')) || t('scan.na')
      }, actions: [] };
    }
    if (/^BEGIN:VCARD/i.test(text)){
      const line = (k) => (text.match(new RegExp('^' + k + '[^:]*:(.*)$', 'im')) || [])[1] || '';
      return { badge: t('scan.badge.vcard'), fields: {
        [t('scan.field.name')]: line('FN') || t('scan.na'),
        [t('scan.field.tel')]: line('TEL') || t('scan.na'),
        [t('scan.field.email')]: line('EMAIL') || t('scan.na'),
        [t('scan.field.org')]: line('ORG') || t('scan.na')
      }, actions: [] };
    }
    if (/^mailto:/i.test(text)){
      const addr = text.replace(/^mailto:/i, '').split('?')[0];
      return { badge: t('scan.badge.email'), fields: { [t('scan.field.email')]: addr || t('scan.na') }, actions: [{ label: t('scan.action.sendEmail'), href: text }] };
    }
    if (/^tel:/i.test(text)){
      const num = text.replace(/^tel:/i, '');
      return { badge: t('scan.badge.tel'), fields: { [t('scan.field.tel')]: num }, actions: [{ label: t('scan.action.call'), href: text }] };
    }
    if (/^SMSTO:/i.test(text)){
      const [, num, msg] = text.match(/^SMSTO:([^:]*):?(.*)$/i) || [];
      return { badge: t('scan.badge.sms'), fields: { [t('scan.field.smsNum')]: num || t('scan.na'), [t('scan.field.smsMsg')]: msg || t('scan.na') }, actions: [] };
    }
    if (/^geo:/i.test(text)){
      const coords = text.replace(/^geo:/i, '');
      return { badge: t('scan.badge.geo'), fields: { [t('scan.field.coords')]: coords }, actions: [{ label: t('scan.action.openMaps'), href: `https://maps.google.com/?q=${coords}` }] };
    }
    return { badge: t('scan.badge.text'), fields: {}, actions: [] };
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  /* Renders the result panel for `text` without touching history — used both
     for a fresh scan and to re-render after a language switch. */
  function displayResult(text){
    lastShownText = text;
    const info = interpret(text);
    resultType.textContent = info.badge;
    resultFields.innerHTML = '';
    Object.entries(info.fields).forEach(([k, v]) => {
      resultFields.innerHTML += `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`;
    });
    resultRaw.textContent = text;
    resultActions.innerHTML = '';
    info.actions.forEach(a => {
      const link = document.createElement('a');
      link.href = a.href; link.target = '_blank'; link.rel = 'noopener';
      link.className = 'btn btn-primary'; link.textContent = a.label;
      resultActions.appendChild(link);
    });
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-ghost-dark'; copyBtn.type = 'button'; copyBtn.textContent = QRMO_I18N.t('scan.copy');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(text).then(() => { copyBtn.textContent = QRMO_I18N.t('scan.copied'); setTimeout(() => copyBtn.textContent = QRMO_I18N.t('scan.copy'), 1500); });
    });
    resultActions.appendChild(copyBtn);
    resultBox.hidden = false;
  }

  function showResult(text){
    displayResult(text);
    const info = interpret(text);
    history.unshift({ text, badge: info.badge, at: Date.now() });
    if (history.length > HISTORY_MAX) history.length = HISTORY_MAX;
    saveHistory(history);
    renderHistory();
  }

  function renderHistory(){
    historyWrap.hidden = history.length === 0;
    historyList.innerHTML = '';
    history.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${escapeHtml(interpret(item.text).badge)}</span><span class="mono">${escapeHtml(item.text)}</span>`;
      li.addEventListener('click', () => displayResult(item.text));
      historyList.appendChild(li);
    });
  }

  exportHistoryBtn.addEventListener('click', () => {
    if (!history.length) return;
    const rows = [['type', 'text', 'scanned_at']];
    history.forEach(item => rows.push([interpret(item.text).badge, item.text, new Date(item.at).toISOString()]));
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'qrmo-scan-history.csv';
    document.body.appendChild(a); a.click(); a.remove();
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
  });

  /* ---- camera loop ---- */
  async function startCamera(){
    try{
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    }catch(err){
      camHint.textContent = QRMO_I18N.t('scan.err.camera');
      return;
    }
    video.srcObject = stream;
    video.hidden = false; placeholder.hidden = true; viewfinder.hidden = false;
    await video.play();
    startBtn.hidden = true; stopBtn.hidden = false;
    camHint.textContent = '';
    tick();
  }

  function stopCamera(){
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    video.hidden = true; placeholder.hidden = false; viewfinder.hidden = true;
    startBtn.hidden = false; stopBtn.hidden = true;
  }

  function tick(){
    if (!stream) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA){
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data){
        const now = Date.now();
        if (code.data !== lastText || now - lastAt > 2500){
          lastText = code.data; lastAt = now;
          showResult(code.data);
        }
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  startBtn.addEventListener('click', startCamera);
  stopBtn.addEventListener('click', stopCamera);
  window.addEventListener('beforeunload', stopCamera);

  /* ---- scan from uploaded image ---- */
  imgInput.addEventListener('change', () => {
    const file = imgInput.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data){
        showResult(code.data);
      }else{
        camHint.textContent = QRMO_I18N.t('scan.err.noCode');
      }
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });

  renderHistory();
});
