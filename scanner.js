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

  let stream = null, rafId = null, lastText = null, lastAt = 0;
  const history = [];

  /* ---- interpret decoded text into a friendly summary ---- */
  function interpret(text){
    if (/^https?:\/\//i.test(text)){
      return { badge: 'رابط', fields: {}, actions: [{ label: 'افتح الرابط', href: text }] };
    }
    if (/^WIFI:/i.test(text)){
      const get = (k) => (text.match(new RegExp(k + ':((?:[^\\\\;]|\\\\.)*)')) || [])[1];
      const clean = (v) => (v || '').replace(/\\(.)/g, '$1');
      return { badge: 'شبكة واي فاي', fields: {
        'اسم الشبكة': clean(get('S')) || '—',
        'كلمة السر': clean(get('P')) || '—',
        'التشفير': clean(get('T')) || '—'
      }, actions: [] };
    }
    if (/^BEGIN:VCARD/i.test(text)){
      const line = (k) => (text.match(new RegExp('^' + k + '[^:]*:(.*)$', 'im')) || [])[1] || '';
      return { badge: 'جهة اتصال', fields: {
        'الاسم': line('FN') || '—',
        'التليفون': line('TEL') || '—',
        'الإيميل': line('EMAIL') || '—',
        'الشركة': line('ORG') || '—'
      }, actions: [] };
    }
    if (/^mailto:/i.test(text)){
      const addr = text.replace(/^mailto:/i, '').split('?')[0];
      return { badge: 'إيميل', fields: { 'العنوان': addr || '—' }, actions: [{ label: 'ابعت إيميل', href: text }] };
    }
    if (/^tel:/i.test(text)){
      const num = text.replace(/^tel:/i, '');
      return { badge: 'رقم تليفون', fields: { 'الرقم': num }, actions: [{ label: 'اتصل', href: text }] };
    }
    if (/^SMSTO:/i.test(text)){
      const [, num, msg] = text.match(/^SMSTO:([^:]*):?(.*)$/i) || [];
      return { badge: 'رسالة SMS', fields: { 'الرقم': num || '—', 'الرسالة': msg || '—' }, actions: [] };
    }
    if (/^geo:/i.test(text)){
      const coords = text.replace(/^geo:/i, '');
      return { badge: 'موقع جغرافي', fields: { 'الإحداثيات': coords }, actions: [{ label: 'افتح في خرائط جوجل', href: `https://maps.google.com/?q=${coords}` }] };
    }
    return { badge: 'نص', fields: {}, actions: [] };
  }

  function showResult(text){
    const info = interpret(text);
    resultType.textContent = info.badge;
    resultFields.innerHTML = '';
    Object.entries(info.fields).forEach(([k, v]) => {
      resultFields.innerHTML += `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`;
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
    copyBtn.className = 'btn btn-ghost-dark'; copyBtn.type = 'button'; copyBtn.textContent = 'نسخ النص';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(text).then(() => { copyBtn.textContent = 'اتنسخ ✓'; setTimeout(() => copyBtn.textContent = 'نسخ النص', 1500); });
    });
    resultActions.appendChild(copyBtn);
    resultBox.hidden = false;

    history.unshift({ text, badge: info.badge, at: Date.now() });
    if (history.length > 8) history.pop();
    renderHistory();
  }

  function renderHistory(){
    historyWrap.hidden = history.length === 0;
    historyList.innerHTML = '';
    history.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.badge}</span><span class="mono">${escapeHtml(item.text)}</span>`;
      li.addEventListener('click', () => showResult(item.text));
      historyList.appendChild(li);
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  /* ---- camera loop ---- */
  async function startCamera(){
    try{
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    }catch(err){
      camHint.textContent = 'معرفناش نوصل للكاميرا. تأكد إنك سمحت بالإذن، أو جرّب رفع صورة بدل ذلك.';
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
        camHint.textContent = 'معرفناش نلاقي كود QR واضح في الصورة دي.';
      }
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
});
