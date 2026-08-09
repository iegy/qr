// qrmo — full generator page logic
document.addEventListener('DOMContentLoaded', () => {

  const state = {
    type: 'link',
    fg: '#17171f',
    bg: '#ffffff',
    dotStyle: 'square',
    cornerStyle: 'square',
    ecLevel: 'M',
    size: 300,
    logo: null
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

  function currentOptions(){
    const data = QRMO.buildPayload(state.type, collectData()) || ' ';
    return { data, size: state.size, fg: state.fg, bg: state.bg, dotStyle: state.dotStyle, cornerStyle: state.cornerStyle, ecLevel: state.ecLevel, logo: state.logo };
  }

  let renderTimer;
  function render(){
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => { QRMO.updateQR(qr, currentOptions()); }, 150);
  }

  /* ---- type tabs ---- */
  const tabs = document.getElementById('typeTabs');
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-tab');
    if (!btn) return;
    tabs.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.type = btn.dataset.type;
    document.querySelectorAll('.type-fields').forEach(f => { f.hidden = f.dataset.fields !== state.type; });
    render();
  });

  document.querySelectorAll('.type-fields').forEach(f => f.addEventListener('input', render));
  document.querySelectorAll('.type-fields').forEach(f => f.addEventListener('change', render));

  /* ---- customization ---- */
  const fg = document.getElementById('f-fg'), fgVal = document.getElementById('fgVal');
  fg.addEventListener('input', () => { state.fg = fg.value; fgVal.textContent = fg.value; render(); });

  const bg = document.getElementById('f-bg'), bgVal = document.getElementById('bgVal');
  bg.addEventListener('input', () => { state.bg = bg.value; bgVal.textContent = bg.value; render(); });

  function wirePick(id, key){
    const el = document.getElementById(id);
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      el.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state[key] = btn.dataset.val;
      render();
    });
  }
  wirePick('dotStylePick', 'dotStyle');
  wirePick('cornerStylePick', 'cornerStyle');
  wirePick('ecPick', 'ecLevel');

  const sizeInput = document.getElementById('f-size'), sizeVal = document.getElementById('sizeVal');
  sizeInput.addEventListener('input', () => { state.size = Number(sizeInput.value); sizeVal.textContent = state.size; render(); });

  const logoInput = document.getElementById('f-logo'), clearLogo = document.getElementById('clearLogo');
  logoInput.addEventListener('change', async () => {
    const file = logoInput.files[0];
    if (!file) return;
    state.logo = await QRMO.readFileAsDataURL(file);
    clearLogo.hidden = false;
    render();
  });
  clearLogo.addEventListener('click', () => {
    state.logo = null; logoInput.value = ''; clearLogo.hidden = true; render();
  });

  /* ---- downloads ---- */
  document.getElementById('dlPng').addEventListener('click', () => QRMO.download(qr, 'qrmo', 'png'));
  document.getElementById('dlSvg').addEventListener('click', () => QRMO.downloadAsSvg(currentOptions(), 'qrmo'));

  render();
});
