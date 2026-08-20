// qrmo — efficient client-side scanner (throttled + downscaled + inverted QR support).
document.addEventListener('DOMContentLoaded', () => {
  const video=document.getElementById('video'), placeholder=document.getElementById('videoPlaceholder'), viewfinder=document.getElementById('viewfinder');
  const canvas=document.getElementById('captureCanvas'), ctx=canvas.getContext('2d',{willReadFrequently:true});
  const startBtn=document.getElementById('startBtn'), stopBtn=document.getElementById('stopBtn'), camHint=document.getElementById('camHint'), imgInput=document.getElementById('imgInput');
  const resultBox=document.getElementById('scanResult'), resultType=document.getElementById('resultType'), resultFields=document.getElementById('resultFields'), resultRaw=document.getElementById('resultRaw'), resultActions=document.getElementById('resultActions');
  const historyWrap=document.getElementById('historyWrap'), historyList=document.getElementById('historyList'), exportHistoryBtn=document.getElementById('exportHistoryBtn'), clearHistoryBtn=document.getElementById('clearHistoryBtn');
  const HISTORY_KEY='qrmo-scan-history-v2', HISTORY_MAX=50, SCAN_INTERVAL=120, MAX_SIDE=900;
  let stream=null, rafId=null, lastScanAt=0, lastText=null, lastAt=0, lastShownText=null;

  const loadHistory=()=>{try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch(e){return[]}};
  const saveHistory=(items)=>localStorage.setItem(HISTORY_KEY,JSON.stringify(items.slice(0,HISTORY_MAX)));
  let history=loadHistory();

  function interpret(text){
    const t=QRMO_I18N.t;
    if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(text)) return {badge:t('scan.badge.whatsapp'),fields:{},actions:[{label:t('scan.action.openWhatsapp'),href:text}]};
    if (/^https?:\/\//i.test(text)) return {badge:t('scan.badge.link'),fields:{},actions:[{label:t('scan.action.openLink'),href:text}]};
    if (/^BEGIN:VEVENT/i.test(text)){
      const line=(k)=>(text.match(new RegExp('^'+k+':(.*)$','im'))||[])[1]||'';
      return {badge:t('scan.badge.event'),fields:{[t('scan.field.title')]:line('SUMMARY')||t('scan.na'),[t('scan.field.location')]:line('LOCATION')||t('scan.na')},actions:[]};
    }
    if (/^WIFI:/i.test(text)){
      const get=(k)=>(text.match(new RegExp(k+':((?:[^\\\\;]|\\\\.)*)'))||[])[1]; const clean=(v)=>(v||'').replace(/\\(.)/g,'$1');
      return {badge:t('scan.badge.wifi'),fields:{[t('scan.field.ssid')]:clean(get('S'))||t('scan.na'),[t('scan.field.pass')]:clean(get('P'))||t('scan.na'),[t('scan.field.enc')]:clean(get('T'))||t('scan.na')},actions:[]};
    }
    if (/^BEGIN:VCARD/i.test(text)){
      const line=(k)=>(text.match(new RegExp('^'+k+'[^:]*:(.*)$','im'))||[])[1]||'';
      return {badge:t('scan.badge.vcard'),fields:{[t('scan.field.name')]:line('FN')||t('scan.na'),[t('scan.field.tel')]:line('TEL')||t('scan.na'),[t('scan.field.email')]:line('EMAIL')||t('scan.na'),[t('scan.field.org')]:line('ORG')||t('scan.na')},actions:[]};
    }
    if (/^mailto:/i.test(text)){const addr=text.replace(/^mailto:/i,'').split('?')[0];return{badge:t('scan.badge.email'),fields:{[t('scan.field.email')]:addr||t('scan.na')},actions:[{label:t('scan.action.sendEmail'),href:text}]};}
    if (/^tel:/i.test(text)){const num=text.replace(/^tel:/i,'');return{badge:t('scan.badge.tel'),fields:{[t('scan.field.tel')]:num},actions:[{label:t('scan.action.call'),href:text}]};}
    if (/^SMSTO:/i.test(text)){const [,num,msg]=text.match(/^SMSTO:([^:]*):?(.*)$/i)||[];return{badge:t('scan.badge.sms'),fields:{[t('scan.field.smsNum')]:num||t('scan.na'),[t('scan.field.smsMsg')]:msg||t('scan.na')},actions:[]};}
    if (/^geo:/i.test(text)){const coords=text.replace(/^geo:/i,'');return{badge:t('scan.badge.geo'),fields:{[t('scan.field.coords')]:coords},actions:[{label:t('scan.action.openMaps'),href:`https://maps.google.com/?q=${encodeURIComponent(coords)}`}]};}
    return {badge:t('scan.badge.text'),fields:{},actions:[]};
  }
  const escapeHtml=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function displayResult(text){
    lastShownText=text; const info=interpret(text); resultType.textContent=info.badge; resultFields.innerHTML='';
    Object.entries(info.fields).forEach(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;resultFields.append(dt,dd);});
    resultRaw.textContent=text; resultActions.innerHTML='';
    info.actions.forEach(a=>{const link=document.createElement('a');link.href=a.href;link.target='_blank';link.rel='noopener';link.className='btn btn-primary';link.textContent=a.label;resultActions.appendChild(link);});
    const copyBtn=document.createElement('button'); copyBtn.className='btn btn-ghost-dark'; copyBtn.type='button'; copyBtn.textContent=QRMO_I18N.t('scan.copy');
    copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);copyBtn.textContent=QRMO_I18N.t('scan.copied');setTimeout(()=>copyBtn.textContent=QRMO_I18N.t('scan.copy'),1500)}catch(e){}});
    resultActions.appendChild(copyBtn); resultBox.hidden=false;
  }
  function showResult(text){
    displayResult(text); const info=interpret(text); history.unshift({text,badge:info.badge,at:Date.now()}); history=history.slice(0,HISTORY_MAX); saveHistory(history); renderHistory();
  }
  function renderHistory(){
    historyWrap.hidden=!history.length; historyList.innerHTML=''; history.forEach(item=>{const li=document.createElement('li');const a=document.createElement('span');a.textContent=interpret(item.text).badge;const b=document.createElement('span');b.className='mono';b.textContent=item.text;li.append(a,b);li.addEventListener('click',()=>displayResult(item.text));historyList.appendChild(li);});
  }

  exportHistoryBtn.addEventListener('click',()=>{if(!history.length)return;const rows=[['type','text','scanned_at'],...history.map(i=>[interpret(i.text).badge,i.text,new Date(i.at).toISOString()])];const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='qrmo-scan-history.csv';a.click();URL.revokeObjectURL(url);});
  clearHistoryBtn.addEventListener('click',()=>{history=[];saveHistory(history);renderHistory();});
  document.addEventListener('qrmo:langchange',()=>{renderHistory();if(!resultBox.hidden&&lastShownText!==null)displayResult(lastShownText);});

  function scanSource(source,w,h,maxSide=MAX_SIDE){
    const scale=Math.min(1,maxSide/Math.max(w,h)); const sw=Math.max(1,Math.round(w*scale)), sh=Math.max(1,Math.round(h*scale));
    canvas.width=sw;canvas.height=sh;ctx.drawImage(source,0,0,sw,sh);const img=ctx.getImageData(0,0,sw,sh);return jsQR(img.data,sw,sh,{inversionAttempts:'attemptBoth'});
  }
  async function startCamera(){
    camHint.textContent='';
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});}catch(err){camHint.textContent=QRMO_I18N.t('scan.err.camera');return;}
    video.srcObject=stream;video.hidden=false;placeholder.hidden=true;viewfinder.hidden=false;await video.play();startBtn.hidden=true;stopBtn.hidden=false;lastScanAt=0;tick(performance.now());
  }
  function stopCamera(){if(rafId)cancelAnimationFrame(rafId);rafId=null;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.hidden=true;placeholder.hidden=false;viewfinder.hidden=true;startBtn.hidden=false;stopBtn.hidden=true;}
  function tick(now){
    if(!stream)return;
    if(now-lastScanAt>=SCAN_INTERVAL&&video.readyState===video.HAVE_ENOUGH_DATA){lastScanAt=now;const code=scanSource(video,video.videoWidth,video.videoHeight);if(code?.data){const t=Date.now();if(code.data!==lastText||t-lastAt>2500){lastText=code.data;lastAt=t;showResult(code.data);if(navigator.vibrate)navigator.vibrate(35);}}}
    rafId=requestAnimationFrame(tick);
  }
  startBtn.addEventListener('click',startCamera);stopBtn.addEventListener('click',stopCamera);window.addEventListener('pagehide',stopCamera);
  imgInput.addEventListener('change',()=>{const file=imgInput.files[0];if(!file)return;camHint.textContent='';const img=new Image();img.onload=()=>{const code=scanSource(img,img.naturalWidth,img.naturalHeight,1600);if(code?.data)showResult(code.data);else camHint.textContent=QRMO_I18N.t('scan.err.noCode');URL.revokeObjectURL(img.src);};img.onerror=()=>{camHint.textContent=QRMO_I18N.t('scan.err.noCode');};img.src=URL.createObjectURL(file);});
  renderHistory();
});
