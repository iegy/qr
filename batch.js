// qrmo — batch generation logic
document.addEventListener('DOMContentLoaded', () => {

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const pasteArea = document.getElementById('pasteArea');
  const previewBtn = document.getElementById('previewBtn');
  const resultsPanel = document.getElementById('resultsPanel');
  const rowsBody = document.getElementById('rowsBody');
  const rowCount = document.getElementById('rowCount');
  const generateBtn = document.getElementById('generateBtn');
  const batchGrid = document.getElementById('batchGrid');
  const exportActions = document.getElementById('exportActions');
  const batchType = document.getElementById('batchType');
  const batchFg = document.getElementById('batchFg'), batchFgVal = document.getElementById('batchFgVal');

  let rows = [];
  let generated = []; // { label, dataUrl }

  batchFg.addEventListener('input', () => { batchFgVal.textContent = batchFg.value; });

  dropzone.addEventListener('click', () => fileInput.click());
  ['dragover','dragenter'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('drag'); }));
  ['dragleave','dragend'].forEach(evt => dropzone.addEventListener(evt, () => dropzone.classList.remove('drag')));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault(); dropzone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) readFile(fileInput.files[0]); });

  function readFile(file){
    const reader = new FileReader();
    reader.onload = () => { pasteArea.value = reader.result; };
    reader.readAsText(file);
  }

  /* Proper CSV tokenizer (RFC 4180-ish): handles quoted fields, commas and
     newlines inside quotes, and "" as an escaped quote. A plain list with no
     quoting still works exactly like a naive split would, so old input keeps
     behaving the same — this only fixes the case a naive split gets wrong. */
  function parseCSV(text){
    const rows = [];
    let row = [], field = '', inQuotes = false, i = 0;
    while (i < text.length){
      const ch = text[i];
      if (inQuotes){
        if (ch === '"'){
          if (text[i + 1] === '"'){ field += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        }
        field += ch; i++; continue;
      }
      if (ch === '"'){ inQuotes = true; i++; continue; }
      if (ch === ','){ row.push(field); field = ''; i++; continue; }
      if (ch === '\r'){ i++; continue; }
      if (ch === '\n'){ row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += ch; i++;
    }
    if (field.length || row.length){ row.push(field); rows.push(row); }
    return rows;
  }

  function parseRows(raw){
    return parseCSV(raw)
      .map(cols => cols.map(c => c.trim()))
      .filter(cols => cols.some(Boolean))
      .map((cols, i) => {
        if (cols.length > 1 && cols[0] && cols.slice(1).join(',')){
          return { label: cols[0], value: cols.slice(1).join(',') };
        }
        return { label: `qr-${i + 1}`, value: cols.join(',') };
      });
  }

  function buildBatchPayload(value){
    const type = batchType.value;
    if (type === 'tel') return 'tel:' + value;
    if (type === 'mailto') return 'mailto:' + value;
    // auto: url-ish (no spaces, has a dot or a scheme) -> link, else raw text
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) || (/\.[a-z]{2,}/i.test(value) && !/\s/.test(value))){
      return QRMO.buildPayload('link', { url: value });
    }
    return value;
  }

  function sanitize(name){
    return name.replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '') || 'qr';
  }

  previewBtn.addEventListener('click', () => {
    rows = parseRows(pasteArea.value);
    rowsBody.innerHTML = '';
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(r.label)}</td><td class="mono">${escapeHtml(r.value)}</td>`;
      rowsBody.appendChild(tr);
    });
    rowCount.textContent = rows.length;
    resultsPanel.hidden = rows.length === 0;
    batchGrid.innerHTML = '';
    exportActions.hidden = true;
    generated = [];
  });

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  generateBtn.addEventListener('click', async () => {
    if (!rows.length) return;
    batchGrid.innerHTML = '';
    generated = [];
    generateBtn.disabled = true;
    generateBtn.textContent = QRMO_I18N.t('batch.generating');

    for (const row of rows){
      const thumb = document.createElement('div');
      thumb.className = 'batch-thumb';
      const label = document.createElement('span');
      label.textContent = row.label;

      const qr = QRMO.createQR({
        data: buildBatchPayload(row.value) || ' ',
        size: 126,
        fg: batchFg.value,
        bg: '#ffffff'
      }, 'canvas');
      qr.append(thumb);
      thumb.appendChild(label);
      batchGrid.appendChild(thumb);

      // give the canvas a tick to draw before reading it
      await new Promise(r => setTimeout(r, 20));
      const canvas = thumb.querySelector('canvas');
      const dataUrl = canvas ? canvas.toDataURL('image/png') : null;
      if (dataUrl) generated.push({ label: row.label, dataUrl });
    }

    generateBtn.disabled = false;
    generateBtn.textContent = QRMO_I18N.t('batch.generateBtn');
    exportActions.hidden = generated.length === 0;
  });

  document.getElementById('downloadZip').addEventListener('click', async () => {
    if (!generated.length) return;
    const zip = new JSZip();
    const used = new Set();
    generated.forEach(item => {
      let name = sanitize(item.label);
      let finalName = name;
      let n = 2;
      while (used.has(finalName)){ finalName = `${name}-${n++}`; }
      used.add(finalName);
      const base64 = item.dataUrl.split(',')[1];
      zip.file(`${finalName}.png`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'qrmo-batch.zip';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById('printSheetBtn').addEventListener('click', () => {
    if (!generated.length) return;
    const grid = document.getElementById('printGrid');
    grid.innerHTML = '';
    generated.forEach(item => {
      const div = document.createElement('div');
      div.className = 'print-item';
      div.innerHTML = `<img src="${item.dataUrl}" width="120" height="120"><span>${escapeHtml(item.label)}</span>`;
      grid.appendChild(div);
    });
    window.print();
  });
});
