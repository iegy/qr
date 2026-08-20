// qrmo — advanced bulk generation with CSV column mapping.
document.addEventListener('DOMContentLoaded', () => {
  const $=id=>document.getElementById(id);
  const dropzone=$('dropzone'),fileInput=$('fileInput'),pasteArea=$('pasteArea'),previewBtn=$('previewBtn'),resultsPanel=$('resultsPanel'),rowsBody=$('rowsBody'),rowCount=$('rowCount'),generateBtn=$('generateBtn'),batchGrid=$('batchGrid'),exportActions=$('exportActions'),batchType=$('batchType'),batchFg=$('batchFg'),batchFgVal=$('batchFgVal'),mappingPanel=$('mappingPanel'),progress=$('batchProgress');
  const maps={label:$('mapLabel'),value:$('mapValue'),type:$('mapType'),color:$('mapColor')};
  let matrix=[],headers=[],dataRows=[],hasHeader=false,rows=[],generated=[];
  batchFg.addEventListener('input',()=>batchFgVal.textContent=batchFg.value);
  dropzone.addEventListener('click',()=>fileInput.click());
  ['dragover','dragenter'].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.classList.add('drag')}));
  ['dragleave','dragend'].forEach(evt=>dropzone.addEventListener(evt,()=>dropzone.classList.remove('drag')));
  dropzone.addEventListener('drop',e=>{e.preventDefault();dropzone.classList.remove('drag');const f=e.dataTransfer.files[0];if(f)readFile(f)});
  fileInput.addEventListener('change',()=>{if(fileInput.files[0])readFile(fileInput.files[0])});
  function readFile(file){const r=new FileReader();r.onload=()=>pasteArea.value=r.result;r.readAsText(file);}

  function parseCSV(text){
    const out=[];let row=[],field='',inQuotes=false,i=0;
    while(i<text.length){const ch=text[i];if(inQuotes){if(ch==='"'){if(text[i+1]==='"'){field+='"';i+=2;continue}inQuotes=false;i++;continue}field+=ch;i++;continue}if(ch==='"'){inQuotes=true;i++;continue}if(ch===','){row.push(field);field='';i++;continue}if(ch==='\r'){i++;continue}if(ch==='\n'){row.push(field);out.push(row);row=[];field='';i++;continue}field+=ch;i++;}
    if(field.length||row.length){row.push(field);out.push(row)}return out.map(r=>r.map(c=>c.trim())).filter(r=>r.some(Boolean));
  }
  function looksHeader(row){const keys=['label','name','title','اسم','تسمية','url','link','value','رابط','قيمة','type','نوع','color','colour','لون'];return row.some(c=>keys.includes(String(c).trim().toLowerCase()));}
  function fillSelect(select, allowNone=true){select.innerHTML='';if(allowNone){const o=document.createElement('option');o.value='';o.textContent=QRMO_I18N.t('batch.mapping.none');select.appendChild(o)}headers.forEach((h,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=h||`Column ${i+1}`;select.appendChild(o)});}
  function findHeader(names){for(let i=0;i<headers.length;i++){const h=headers[i].trim().toLowerCase();if(names.includes(h))return i}return -1;}
  function setupMapping(){
    Object.values(maps).forEach(s=>fillSelect(s,true));
    let value=findHeader(['url','link','value','رابط','قيمة','data']); if(value<0)value=headers.length>1?1:0;
    let label=findHeader(['label','name','title','اسم','تسمية']); if(label<0&&headers.length>1)label=0;
    const type=findHeader(['type','نوع']); const color=findHeader(['color','colour','لون','hex']);
    maps.value.value=String(value);maps.label.value=label>=0?String(label):'';maps.type.value=type>=0?String(type):'';maps.color.value=color>=0?String(color):'';
  }
  function normType(v){v=String(v||'').trim().toLowerCase();const aliases={url:'url',link:'url','رابط':'url',text:'text','نص':'text',tel:'tel',phone:'tel','تليفون':'tel','هاتف':'tel',mailto:'mailto',email:'mailto','إيميل':'mailto',whatsapp:'whatsapp','واتساب':'whatsapp'};return aliases[v]||batchType.value||'auto';}
  function validColor(v){v=String(v||'').trim();return /^#[0-9a-f]{6}$/i.test(v)?v:batchFg.value;}
  function buildRows(){
    const li=maps.label.value===''?-1:Number(maps.label.value),vi=maps.value.value===''?0:Number(maps.value.value),ti=maps.type.value===''?-1:Number(maps.type.value),ci=maps.color.value===''?-1:Number(maps.color.value);
    rows=dataRows.map((cols,i)=>({label:li>=0?(cols[li]||`qr-${i+1}`):`qr-${i+1}`,value:cols[vi]||'',type:ti>=0?normType(cols[ti]):batchType.value,color:ci>=0?validColor(cols[ci]):batchFg.value})).filter(r=>r.value);
    renderPreview();
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderPreview(){rowsBody.innerHTML='';rows.slice(0,250).forEach(r=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${escapeHtml(r.label)}</td><td class="mono">${escapeHtml(r.value)}</td><td>${escapeHtml(r.type)}</td><td><span class="color-dot" style="--dot:${escapeHtml(r.color)}"></span><span class="mono">${escapeHtml(r.color)}</span></td>`;rowsBody.appendChild(tr)});rowCount.textContent=rows.length;resultsPanel.hidden=!rows.length;batchGrid.innerHTML='';exportActions.hidden=true;generated=[];progress.textContent=rows.length>250?`250 / ${rows.length} previewed`:'';}
  previewBtn.addEventListener('click',()=>{matrix=parseCSV(pasteArea.value);if(!matrix.length){resultsPanel.hidden=true;mappingPanel.hidden=true;return}hasHeader=looksHeader(matrix[0]);headers=hasHeader?matrix[0]:matrix[0].map((_,i)=>`Column ${i+1}`);dataRows=hasHeader?matrix.slice(1):matrix;setupMapping();mappingPanel.hidden=headers.length<2;buildRows();});
  Object.values(maps).forEach(s=>s.addEventListener('change',buildRows)); batchType.addEventListener('change',()=>{if(matrix.length)buildRows()});

  function payloadFor(row){const v=row.value,t=row.type;if(t==='tel')return `tel:${v}`;if(t==='mailto')return `mailto:${v}`;if(t==='whatsapp')return QRMO.buildPayload('whatsapp',{phone:v});if(t==='url')return QRMO.buildPayload('link',{url:v});if(t==='text')return v;if(/^[a-z][a-z0-9+.-]*:\/\//i.test(v)||(/\.[a-z]{2,}/i.test(v)&&!/\s/.test(v)))return QRMO.buildPayload('link',{url:v});return v;}
  const sanitize=name=>String(name).replace(/[^\p{L}\p{N}_-]+/gu,'-').replace(/^-+|-+$/g,'')||'qr';
  generateBtn.addEventListener('click',async()=>{if(!rows.length)return;batchGrid.innerHTML='';generated=[];generateBtn.disabled=true;exportActions.hidden=true;const original=generateBtn.textContent;generateBtn.textContent=QRMO_I18N.t('batch.generating');for(let i=0;i<rows.length;i++){const row=rows[i],thumb=document.createElement('div');thumb.className='batch-thumb';const label=document.createElement('span');label.textContent=row.label;const q=QRMO.createQR({data:payloadFor(row)||' ',size:126,fg:row.color,bg:'#ffffff',ecLevel:'M'},'canvas');q.append(thumb);thumb.appendChild(label);batchGrid.appendChild(thumb);let canvas=null;for(let n=0;n<6&&!canvas;n++){await new Promise(requestAnimationFrame);canvas=thumb.querySelector('canvas')}if(canvas)generated.push({label:row.label,dataUrl:canvas.toDataURL('image/png')});progress.textContent=`${i+1} / ${rows.length}`;if(i%12===11)await new Promise(requestAnimationFrame);}generateBtn.disabled=false;generateBtn.textContent=original;exportActions.hidden=!generated.length;});
  $('downloadZip').addEventListener('click',async()=>{if(!generated.length)return;const zip=new JSZip(),used=new Set();generated.forEach(item=>{let name=sanitize(item.label),final=name,n=2;while(used.has(final))final=`${name}-${n++}`;used.add(final);zip.file(`${final}.png`,item.dataUrl.split(',')[1],{base64:true});});const blob=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='qrmo-batch.zip';a.click();URL.revokeObjectURL(url);});
  $('printSheetBtn').addEventListener('click',()=>{if(!generated.length)return;const grid=$('printGrid');grid.innerHTML='';generated.forEach(item=>{const d=document.createElement('div');d.className='print-item';const img=document.createElement('img');img.src=item.dataUrl;img.width=120;img.height=120;const s=document.createElement('span');s.textContent=item.label;d.append(img,s);grid.appendChild(d)});window.print();});
});
