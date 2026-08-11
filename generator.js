// qrmo — full generator page logic
document.addEventListener('DOMContentLoaded', () => {

  const state = {
    type: 'link',
    fg: '#17171f',
    bg: '#ffffff',
    transparent: false,
    gradient: { enabled: false, color2: '#3a4eff', type: 'linear' },
    dotStyle: 'square',
    cornerStyle: 'square',
    cornerDotStyle: 'square',
    ecLevel: 'M',
    size: 300,
    logo: null,
    frame: 'none',
    frameLabel: ''
  };

  const FIELD_MAP = {
    link: { url: 'f-link-url' },
    text: { text: 'f-text' },
    wifi: { ssid: 'f-wifi-ssid', pass: 'f-wifi-pass', enc: 'f-wifi-enc', hidden: 'f-wifi-hidden' },
    vcard: { first: 'f-vc-first', last: 'f-vc-last', org: 'f-vc-org', title: 'f-vc-title', phone: 'f-vc-phone', email: 'f-vc-email', website: 'f-vc-website', address: 'f-vc-address' },
    email: { to: 'f-email-to', subject: 'f-email-subject', body: 'f-email-body' },
    phone: { phone: 'f-phone' },
    sms: { phone: 'f-sms-phone', message: 'f-sms-msg' },
    location: { lat: 'f-loc-lat', lng: 'f-loc-lng' }
  };

  const stage = document.getElementById('qrStage');
  const qr = QRMO.createQR({ data: ' ', ...state }, 'canvas');
  qr.append(stage);

  function collectData(){
    const type = state.type;
    const val = (id) => (document.getElementById(id) || {}).value || '';
    switch(type){
      case 'link': return { url: val('f-link-url') };
      case 'text': return { text: val('f-text') };
      case 'wifi': return { ssid: val('f-wifi-ssid'), pass: val('f-wifi-pass'), enc: val('f-wifi-enc'), hidden: document.getElementById('f-wifi-hidden').checked };
      case 'vcard': return { first: val('f-vc-first'), last: val('f-vc-last'), org: val('f-vc-org'), title: val('f-vc-title'), phone: val('f-vc-phone'), email: val('f-vc-email'), website: val('f-vc-website'), address: val('f-vc-address') };
      case 'email': return { to: val('f-email-to'), subject: val('f-email-subject'), body: val('f-email-body') };
      case 'phone': return { phone: val('f-phone') };
      case 'sms': return { phone: val('f-sms-phone'), message: val('f-sms-msg') };
      case 'location': return { lat: val('f-loc-lat'), lng: val('f-loc-lng') };
      default: return {};
    }
  }

  function applyData(type, data){
    const map = FIELD_MAP[type] || {};
    Object.keys(map).forEach((key) => {
      const el = document.getElementById(map[key]);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!data[key];
      else el.value = data[key] || '';
    });
  }

  function deriveLabel(type, data){
    let raw = '';
    switch(type){
      case 'link': raw = data.url; break;
      case 'text': raw = data.text; break;
      case 'wifi': raw = data.ssid; break;
      case 'vcard': raw = `${data.first || ''} ${data.last || ''}`.trim() || data.org; break;
      case 'email': raw = data.to; break;
      case 'phone': raw = data.phone; break;
      case 'sms': raw = data.phone; break;
      case 'location': raw = data.lat && data.lng ? `${data.lat}, ${data.lng}` : ''; break;
    }
    raw = (raw || '').trim() || type;
    return raw.length > 40 ? raw.slice(0, 40) + '…' : raw;
  }

  function currentOptions(){
    const data = QRMO.buildPayload(state.type, collectData()) || ' ';
    return {
      data, size: state.size, fg: state.fg, bg: state.bg, transparent: state.transparent,
      gradient: state.gradient, dotStyle: state.dotStyle, cornerStyle: state.cornerStyle,
      cornerDotStyle: state.cornerDotStyle, ecLevel: state.ecLevel, logo: state.logo
    };
  }

  /* ---- tabs (ARIA tablist) ---- */
  const tabs = document.getElementById('typeTabs');
  function switchTab(type){
    tabs.querySelectorAll('.type-tab').forEach((b) => {
      const on = b.dataset.type === type;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.type-fields').forEach((f) => { f.hidden = f.dataset.fields !== type; });
    state.type = type;
  }
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-tab');
    if (!btn) return;
    switchTab(btn.dataset.type);
    render();
  });

  document.querySelectorAll('.type-fields').forEach(f => f.addEventListener('input', render));
  document.querySelectorAll('.type-fields').forEach(f => f.addEventListener('change', render));

  /* ---- readability check: contrast + an actual jsQR decode round-trip ---- */
  const warningBox = document.getElementById('qrWarning');
  const okBox = document.getElementById('readableOk');
  let verifyTimer;
  function checkReadability(expectedData){
    clearTimeout(verifyTimer);
    verifyTimer = setTimeout(() => {
      const ratio = QRMO.contrastRatio(state.fg, state.transparent ? '#ffffff' : state.bg);
      if (ratio < 2.2){
        warningBox.hidden = false;
        warningBox.setAttribute('data-i18n', 'gen.warn.contrast');
        warningBox.textContent = QRMO_I18N.t('gen.warn.contrast');
        okBox.hidden = true;
        return;
      }
      const canvas = stage.querySelector('canvas');
      const ok = QRMO.verifyReadable(canvas, expectedData);
      if (ok === false){
        warningBox.hidden = false;
        warningBox.setAttribute('data-i18n', 'gen.warn.unreadable');
        warningBox.textContent = QRMO_I18N.t('gen.warn.unreadable');
        okBox.hidden = true;
      } else if (ok === true){
        warningBox.hidden = true;
        warningBox.removeAttribute('data-i18n');
        okBox.hidden = false;
      } else {
        warningBox.hidden = true;
        warningBox.removeAttribute('data-i18n');
        okBox.hidden = true;
      }
    }, 260);
  }

  let renderTimer;
  function render(){
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      const opts = currentOptions();
      QRMO.updateQR(qr, opts);
      checkReadability(opts.data);
    }, 150);
  }

  /* ---- customization: colors ---- */
  const fg = document.getElementById('f-fg'), fgVal = document.getElementById('fgVal');
  fg.addEventListener('input', () => { state.fg = fg.value; fgVal.textContent = fg.value; render(); });

  const bg = document.getElementById('f-bg'), bgVal = document.getElementById('bgVal');
  bg.addEventListener('input', () => { state.bg = bg.value; bgVal.textContent = bg.value; render(); });

  const transparentCk = document.getElementById('f-transparent');
  transparentCk.addEventListener('change', () => {
    state.transparent = transparentCk.checked;
    bg.disabled = state.transparent;
    render();
  });

  document.getElementById('invertColors').addEventListener('click', () => {
    const oldFg = state.fg, oldBg = state.bg;
    state.fg = oldBg; state.bg = oldFg;
    fg.value = state.fg; fgVal.textContent = state.fg;
    bg.value = state.bg; bgVal.textContent = state.bg;
    render();
  });

  const gradientCk = document.getElementById('f-gradient');
  const gradientOptions = document.getElementById('gradientOptions');
  gradientCk.addEventListener('change', () => {
    state.gradient.enabled = gradientCk.checked;
    gradientOptions.hidden = !gradientCk.checked;
    render();
  });
  const gradient2 = document.getElementById('f-gradient-color2'), gradient2Val = document.getElementById('gradient2Val');
  gradient2.addEventListener('input', () => { state.gradient.color2 = gradient2.value; gradient2Val.textContent = gradient2.value; render(); });

  function wirePick(id, onSet){
    const el = document.getElementById(id);
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      el.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onSet(btn.dataset.val);
      render();
    });
  }
  wirePick('gradientTypePick', (v) => { state.gradient.type = v; });
  wirePick('dotStylePick', (v) => { state.dotStyle = v; });
  wirePick('cornerStylePick', (v) => { state.cornerStyle = v; });
  wirePick('cornerDotStylePick', (v) => { state.cornerDotStyle = v; });
  wirePick('ecPick', (v) => { state.ecLevel = v; });

  const sizeInput = document.getElementById('f-size'), sizeVal = document.getElementById('sizeVal');
  sizeInput.addEventListener('input', () => { state.size = Number(sizeInput.value); sizeVal.textContent = state.size; render(); });

  /* ---- logo: auto-raise error correction so the code stays scannable ---- */
  const logoInput = document.getElementById('f-logo'), clearLogo = document.getElementById('clearLogo');
  const ecPick = document.getElementById('ecPick');
  logoInput.addEventListener('change', async () => {
    const file = logoInput.files[0];
    if (!file) return;
    state.logo = await QRMO.readFileAsDataURL(file);
    clearLogo.hidden = false;
    if (state.ecLevel !== 'H'){
      state.ecLevel = 'H';
      ecPick.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.val === 'H'));
    }
    render();
  });
  clearLogo.addEventListener('click', () => {
    state.logo = null; logoInput.value = ''; clearLogo.hidden = true; render();
  });

  /* ---- frame (scan-me bar) ---- */
  const frameLabelField = document.getElementById('frameLabelField');
  const frameLabelInput = document.getElementById('f-frame-label');
  wirePick('framePick', (v) => {
    state.frame = v;
    frameLabelField.hidden = v === 'none';
  });
  frameLabelInput.addEventListener('input', () => { state.frameLabel = frameLabelInput.value; });

  /* Bakes the frame bar into an actual downloadable PNG (canvas compositing)
     — a CSS-only frame would only ever show in the live preview, never in
     the file someone actually prints or shares. */
  function buildFramedPngDataUrl(){
    const canvas = stage.querySelector('canvas');
    if (!canvas) return null;
    const pad = Math.round(canvas.width * 0.08);
    const barH = Math.round(canvas.width * 0.16);
    const out = document.createElement('canvas');
    out.width = canvas.width + pad * 2;
    out.height = canvas.height + pad * 2 + barH;
    const ctx = out.getContext('2d');
    ctx.fillStyle = state.transparent ? '#ffffff' : state.bg;
    ctx.fillRect(0, 0, out.width, out.height);
    const qrY = state.frame === 'top' ? pad + barH : pad;
    ctx.drawImage(canvas, pad, qrY, canvas.width, canvas.height);
    const barY = state.frame === 'top' ? 0 : out.height - barH;
    ctx.fillStyle = state.fg;
    ctx.fillRect(0, barY, out.width, barH);
    ctx.fillStyle = state.transparent ? '#111219' : state.bg;
    ctx.font = `700 ${Math.round(barH * 0.4)}px 'IBM Plex Sans Arabic', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = (frameLabelInput.value || '').trim() || QRMO_I18N.t('gen.frame.defaultLabel');
    ctx.fillText(label, out.width / 2, barY + barH / 2);
    return out.toDataURL('image/png');
  }

  /* ---- downloads ---- */
  document.getElementById('dlPng').addEventListener('click', () => {
    if (state.frame !== 'none'){
      const dataUrl = buildFramedPngDataUrl();
      if (dataUrl){
        const a = document.createElement('a');
        a.href = dataUrl; a.download = 'qrmo.png';
        document.body.appendChild(a); a.click(); a.remove();
        return;
      }
    }
    QRMO.download(qr, 'qrmo', 'png');
  });
  document.getElementById('dlSvg').addEventListener('click', () => QRMO.downloadAsSvg(currentOptions(), 'qrmo'));

  /* ---- saved codes library (localStorage, this device only) ---- */
  const LIB_KEY = 'qrmo-saved-codes';
  const LIB_MAX = 20;
  const savedList = document.getElementById('savedList');

  function loadLibrary(){
    try{ return JSON.parse(localStorage.getItem(LIB_KEY) || '[]'); }
    catch(e){ return []; }
  }
  function saveLibrary(items){
    localStorage.setItem(LIB_KEY, JSON.stringify(items.slice(0, LIB_MAX)));
  }
  function renderLibrary(){
    const items = loadLibrary();
    savedList.innerHTML = '';
    if (!items.length){
      const li = document.createElement('li');
      li.className = 'empty';
      li.setAttribute('data-i18n', 'gen.lib.empty');
      li.textContent = QRMO_I18N.t('gen.lib.empty');
      savedList.appendChild(li);
      return;
    }
    items.forEach((item) => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'saved-label mono';
      label.textContent = item.label;
      const actions = document.createElement('span');
      actions.className = 'saved-actions';
      const loadBtn = document.createElement('button');
      loadBtn.type = 'button'; loadBtn.textContent = QRMO_I18N.t('gen.lib.load');
      loadBtn.addEventListener('click', () => loadItem(item));
      const delBtn = document.createElement('button');
      delBtn.type = 'button'; delBtn.textContent = QRMO_I18N.t('gen.lib.delete');
      delBtn.addEventListener('click', () => {
        saveLibrary(loadLibrary().filter(i => i.id !== item.id));
        renderLibrary();
      });
      actions.appendChild(loadBtn); actions.appendChild(delBtn);
      li.appendChild(label); li.appendChild(actions);
      savedList.appendChild(li);
    });
  }

  function loadItem(item){
    switchTab(item.type);
    applyData(item.type, item.data);
    Object.assign(state, {
      fg: item.style.fg, bg: item.style.bg, transparent: item.style.transparent,
      gradient: item.style.gradient, dotStyle: item.style.dotStyle, cornerStyle: item.style.cornerStyle,
      cornerDotStyle: item.style.cornerDotStyle, ecLevel: item.style.ecLevel, size: item.style.size,
      frame: item.style.frame, frameLabel: item.style.frameLabel, logo: null
    });
    fg.value = state.fg; fgVal.textContent = state.fg;
    bg.value = state.bg; bgVal.textContent = state.bg;
    transparentCk.checked = state.transparent; bg.disabled = state.transparent;
    gradientCk.checked = state.gradient.enabled; gradientOptions.hidden = !state.gradient.enabled;
    gradient2.value = state.gradient.color2; gradient2Val.textContent = state.gradient.color2;
    document.querySelectorAll('#gradientTypePick button').forEach(b => b.classList.toggle('active', b.dataset.val === state.gradient.type));
    document.querySelectorAll('#dotStylePick button').forEach(b => b.classList.toggle('active', b.dataset.val === state.dotStyle));
    document.querySelectorAll('#cornerStylePick button').forEach(b => b.classList.toggle('active', b.dataset.val === state.cornerStyle));
    document.querySelectorAll('#cornerDotStylePick button').forEach(b => b.classList.toggle('active', b.dataset.val === state.cornerDotStyle));
    document.querySelectorAll('#ecPick button').forEach(b => b.classList.toggle('active', b.dataset.val === state.ecLevel));
    document.querySelectorAll('#framePick button').forEach(b => b.classList.toggle('active', b.dataset.val === state.frame));
    frameLabelField.hidden = state.frame === 'none';
    frameLabelInput.value = state.frameLabel || '';
    sizeInput.value = state.size; sizeVal.textContent = state.size;
    clearLogo.hidden = true; logoInput.value = '';
    render();
  }

  document.getElementById('saveToLibrary').addEventListener('click', () => {
    const data = collectData();
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: state.type,
      data,
      label: deriveLabel(state.type, data),
      style: {
        fg: state.fg, bg: state.bg, transparent: state.transparent, gradient: { ...state.gradient },
        dotStyle: state.dotStyle, cornerStyle: state.cornerStyle, cornerDotStyle: state.cornerDotStyle,
        ecLevel: state.ecLevel, size: state.size, frame: state.frame, frameLabel: state.frameLabel
      }
    };
    const items = loadLibrary();
    items.unshift(item);
    saveLibrary(items);
    renderLibrary();
  });

  document.addEventListener('qrmo:langchange', renderLibrary);

  renderLibrary();
  render();
});
