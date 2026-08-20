// qrmo — home page live mini demo
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('demoInput');
  const preview = document.getElementById('demoPreview');
  const downloadBtn = document.getElementById('demoDownload');
  if (!input || !preview) return;

  let qr = QRMO.createQR({ data: input.value || ' ', size: 200, fg: '#211E1A', bg: '#ffffff' });
  qr.append(preview);

  let timer;
  function render(){
    clearTimeout(timer);
    timer = setTimeout(() => {
      qr.update({ data: input.value.trim() || ' ' });
      preview.classList.remove('scanning');
      void preview.offsetWidth; // restart animation
      preview.classList.add('scanning');
    }, 220);
  }

  input.addEventListener('input', render);

  downloadBtn.addEventListener('click', () => {
    QRMO.download(qr, 'qrmo', 'png');
  });
});
