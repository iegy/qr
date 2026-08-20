// qrmo — generator v2: more payloads, templates, IndexedDB library, health score and print studio.
document.addEventListener('DOMContentLoaded', async () => {
  const state = {
    type:'link', fg:'#211E1A', bg:'#ffffff', transparent:false,
    gradient:{enabled:true,color2:'#E4894B',type:'linear',rotation:0},
    dotStyle:'rounded', cornerStyle:'extra-rounded', cornerDotStyle:'dot',
    ecLevel:'Q', size:300, logo:null, logoSize:.36, frame:'none', frameLabel:''
  };

  const FIELD_MAP = {
    link:{url:'f-link-url'}, text:{text:'f-text'},
    wifi:{ssid:'f-wifi-ssid',pass:'f-wifi-pass',enc:'f-wifi-enc',hidden:'f-wifi-hidden'},
    vcard:{first:'f-vc-first',last:'f-vc-last',org:'f-vc-org',title:'f-vc-title',phone:'f-vc-phone',email:'f-vc-email',website:'f-vc-website',address:'f-vc-address'},
    email:{to:'f-email-to',subject:'f-email-subject',body:'f-email-body'}, phone:{phone:'f-phone'},
    sms:{phone:'f-sms-phone',message:'f-sms-msg'}, location:{lat:'f-loc-lat',lng:'f-loc-lng'},
    whatsapp:{phone:'f-wa-phone',message:'f-wa-message'},
    event:{title:'f-event-title',start:'f-event-start',end:'f-event-end',location:'f-event-location',description:'f-event-description'},
    social:{url:'f-social-url'}, review:{url:'f-review-url'}
  };

  const TEMPLATES = {
    iegy:{fg:'#211E1A',bg:'#FFFFFF',transparent:false,gradient:{enabled:true,color2:'#E4894B',type:'linear',rotation:0},dotStyle:'rounded',cornerStyle:'extra-rounded',cornerDotStyle:'dot',ecLevel:'Q'},
    classic:{fg:'#111111',bg:'#FFFFFF',transparent:false,gradient:{enabled:false,color2:'#111111',type:'linear',rotation:0},dotStyle:'square',cornerStyle:'square',cornerDotStyle:'square',ecLevel:'M'},
    sage:{fg:'#767C63',bg:'#FBF7F1',transparent:false,gradient:{enabled:true,color2:'#9DA287',type:'linear',rotation:0},dotStyle:'rounded',cornerStyle:'extra-rounded',cornerDotStyle:'dot',ecLevel:'Q'},
    orange:{fg:'#8F4E24',bg:'#FBF7F1',transparent:false,gradient:{enabled:true,color2:'#E4894B',type:'radial',rotation:0},dotStyle:'classy-rounded',cornerStyle:'extra-rounded',cornerDotStyle:'dot',ecLevel:'Q'},
    night:{fg:'#F4EFE7',bg:'#211E1A',transparent:false,gradient:{enabled:true,color2:'#F0A46B',type:'linear',rotation:0},dotStyle:'dots',cornerStyle:'extra-rounded',cornerDotStyle:'dot',ecLevel:'H'},
    rounded:{fg:'#211E1A',bg:'#FFFFFF',transparent:false,gradient:{enabled:false,color2:'#E4894B',type:'linear',rotation:0},dotStyle:'extra-rounded',cornerStyle:'extra-rounded',cornerDotStyle:'dot',ecLevel:'Q'}
  };

  const stage=document.getElementById('qrStage');
  const qr=QRMO.createQR({data:' ',...state},'canvas'); qr.append(stage);
  const $=(id)=>document.getElementById(id);
  const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
  const DRAFT_KEY='qrmo-generator-draft-v2';
  let draftTimer=null;

  function collectData(){
    const val=(id)=>($(id)?.value||'');
    switch(state.type){
      case 'link': return {url:val('f-link-url')};
      case 'text': return {text:val('f-text')};
      case 'wifi': return {ssid:val('f-wifi-ssid'),pass:val('f-wifi-pass'),enc:val('f-wifi-enc'),hidden:!!$('f-wifi-hidden')?.checked};
      case 'vcard': return {first:val('f-vc-first'),last:val('f-vc-last'),org:val('f-vc-org'),title:val('f-vc-title'),phone:val('f-vc-phone'),email:val('f-vc-email'),website:val('f-vc-website'),address:val('f-vc-address')};
      case 'email': return {to:val('f-email-to'),subject:val('f-email-subject'),body:val('f-email-body')};
      case 'phone': return {phone:val('f-phone')};
      case 'sms': return {phone:val('f-sms-phone'),message:val('f-sms-msg')};
      case 'location': return {lat:val('f-loc-lat'),lng:val('f-loc-lng')};
      case 'whatsapp': return {phone:val('f-wa-phone'),message:val('f-wa-message')};
      case 'event': return {title:val('f-event-title'),start:val('f-event-start'),end:val('f-event-end'),location:val('f-event-location'),description:val('f-event-description')};
      case 'social': return {url:val('f-social-url')};
      case 'review': return {url:val('f-review-url')};
      default:return{};
    }
  }
  function applyData(type,data){
    const map=FIELD_MAP[type]||{};
    Object.entries(map).forEach(([key,id])=>{const el=$(id);if(!el)return;if(el.type==='checkbox')el.checked=!!data?.[key];else el.value=data?.[key]||'';});
  }
  function deriveLabel(type,data){
    const map={link:data.url,text:data.text,wifi:data.ssid,vcard:`${data.first||''} ${data.last||''}`.trim()||data.org,email:data.to,phone:data.phone,sms:data.phone,location:data.lat&&data.lng?`${data.lat}, ${data.lng}`:'',whatsapp:data.phone,event:data.title,social:data.url,review:data.url};
    let raw=String(map[type]||type).trim()||type; return raw.length>46?raw.slice(0,46)+'…':raw;
  }
  function currentOptions(sizeOverride){
    return {data:QRMO.buildPayload(state.type,collectData())||' ',size:sizeOverride||state.size,fg:state.fg,bg:state.bg,transparent:state.transparent,gradient:{...state.gradient},dotStyle:state.dotStyle,cornerStyle:state.cornerStyle,cornerDotStyle:state.cornerDotStyle,ecLevel:state.ecLevel,logo:state.logo,logoSize:state.logoSize};
  }

  function draftSnapshot(){
    return {
      version:2,
      type:state.type,
      data:collectData(),
      style:{
        fg:state.fg,bg:state.bg,transparent:state.transparent,
        gradient:{...state.gradient},dotStyle:state.dotStyle,
        cornerStyle:state.cornerStyle,cornerDotStyle:state.cornerDotStyle,
        ecLevel:state.ecLevel,size:state.size,frame:state.frame,
        frameLabel:state.frameLabel
      },
      print:{
        sizeMm:$('printSizeMm')?.value||'40',
        dpi:$('printDpi')?.value||'300',
        grid:$('printGrid')?.value||'3x4'
      },
      folder:$('saveFolder')?.value||''
    };
  }
  function saveDraft(){
    try{ localStorage.setItem(DRAFT_KEY,JSON.stringify(draftSnapshot())); }catch(e){}
  }
  function scheduleDraftSave(){
    clearTimeout(draftTimer);
    draftTimer=setTimeout(saveDraft,120);
  }
  function restoreDraft(){
    let draft=null;
    try{ draft=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null'); }catch(e){}
    if(!draft||draft.version!==2)return false;
    const st=draft.style||{};
    if(FIELD_MAP[draft.type]) state.type=draft.type;
    Object.assign(state,{
      fg:st.fg||state.fg,
      bg:st.bg||state.bg,
      transparent:typeof st.transparent==='boolean'?st.transparent:state.transparent,
      gradient:{
        enabled:typeof st.gradient?.enabled==='boolean'?st.gradient.enabled:state.gradient.enabled,
        color2:st.gradient?.color2||state.gradient.color2,
        type:st.gradient?.type||state.gradient.type,
        rotation:Number(st.gradient?.rotation)||0
      },
      dotStyle:st.dotStyle||state.dotStyle,
      cornerStyle:st.cornerStyle||state.cornerStyle,
      cornerDotStyle:st.cornerDotStyle||state.cornerDotStyle,
      ecLevel:st.ecLevel||state.ecLevel,
      size:Number(st.size)||state.size,
      frame:st.frame||state.frame,
      frameLabel:st.frameLabel||''
    });
    switchTab(state.type);
    applyData(state.type,draft.data||{});
    if($('printSizeMm')&&draft.print?.sizeMm)$('printSizeMm').value=draft.print.sizeMm;
    if($('printDpi')&&draft.print?.dpi)$('printDpi').value=draft.print.dpi;
    if($('printGrid')&&draft.print?.grid)$('printGrid').value=draft.print.grid;
    if($('saveFolder'))$('saveFolder').value=draft.folder||'';
    return true;
  }

  const tabs=$('typeTabs');
  function switchTab(type){
    if(!FIELD_MAP[type]) type='link';
    tabs.querySelectorAll('.type-tab').forEach(b=>{const on=b.dataset.type===type;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');});
    document.querySelectorAll('.type-fields').forEach(f=>{f.hidden=f.dataset.fields!==type;}); state.type=type;
  }
  tabs.addEventListener('click',e=>{const btn=e.target.closest('.type-tab');if(!btn)return;switchTab(btn.dataset.type);render();});
  document.querySelectorAll('.type-fields').forEach(f=>{f.addEventListener('input',render);f.addEventListener('change',render);});

  const warningBox=$('qrWarning'), okBox=$('readableOk'), healthScoreEl=$('healthScore'), healthMeter=$('healthMeter'), healthLabel=$('healthLabel');
  let verifyTimer, lastReadable=null;
  function healthText(h){
    const t=QRMO_I18N.t;
    if(h.level==='excellent')return t('gen.health.excellent');
    if(h.level==='good')return t('gen.health.good');
    if(h.level==='fair')return t('gen.health.fair');
    return t('gen.health.poor');
  }
  function updateHealth(opts,readable=lastReadable){
    const h=QRMO.healthScore(opts,readable); healthScoreEl.textContent=h.score; healthMeter.style.width=`${h.score}%`; healthMeter.dataset.level=h.level; healthLabel.textContent=healthText(h); return h;
  }
  function checkReadability(expectedData,opts){
    clearTimeout(verifyTimer); verifyTimer=setTimeout(()=>{
      const bg=state.transparent?'#ffffff':state.bg; const ratio=Math.min(QRMO.contrastRatio(state.fg,bg),state.gradient.enabled?QRMO.contrastRatio(state.gradient.color2,bg):999);
      const canvas=stage.querySelector('canvas'); const readable=QRMO.verifyReadable(canvas,expectedData); lastReadable=readable;
      if(ratio<2.2){warningBox.hidden=false;warningBox.textContent=QRMO_I18N.t('gen.warn.contrast');okBox.hidden=true;}
      else if(readable===false){warningBox.hidden=false;warningBox.textContent=QRMO_I18N.t('gen.warn.unreadable');okBox.hidden=true;}
      else if(readable===true){warningBox.hidden=true;okBox.hidden=false;}
      else{warningBox.hidden=true;okBox.hidden=true;}
      updateHealth(opts,readable);
    },260);
  }
  let renderTimer;
  function render(){scheduleDraftSave();clearTimeout(renderTimer);renderTimer=setTimeout(()=>{const opts=currentOptions();QRMO.updateQR(qr,opts);lastReadable=null;updateHealth(opts,null);checkReadability(opts.data,opts);},130);}

  const fg=$('f-fg'),fgVal=$('fgVal'),bg=$('f-bg'),bgVal=$('bgVal'),transparentCk=$('f-transparent');
  fg.addEventListener('input',()=>{state.fg=fg.value;fgVal.textContent=fg.value;syncTemplateActive();render();});
  bg.addEventListener('input',()=>{state.bg=bg.value;bgVal.textContent=bg.value;syncTemplateActive();render();});
  transparentCk.addEventListener('change',()=>{state.transparent=transparentCk.checked;bg.disabled=state.transparent;syncTemplateActive();render();});
  $('invertColors').addEventListener('click',()=>{[state.fg,state.bg]=[state.bg,state.fg];fg.value=state.fg;fgVal.textContent=state.fg;bg.value=state.bg;bgVal.textContent=state.bg;syncTemplateActive();render();});

  const gradientCk=$('f-gradient'),gradientOptions=$('gradientOptions'),gradient2=$('f-gradient-color2'),gradient2Val=$('gradient2Val');
  gradientCk.addEventListener('change',()=>{state.gradient.enabled=gradientCk.checked;gradientOptions.hidden=!gradientCk.checked;syncTemplateActive();render();});
  gradient2.addEventListener('input',()=>{state.gradient.color2=gradient2.value;gradient2Val.textContent=gradient2.value;syncTemplateActive();render();});
  function wirePick(id,onSet){const el=$(id);el.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;el.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');onSet(btn.dataset.val);syncTemplateActive();render();});}
  wirePick('gradientTypePick',v=>state.gradient.type=v); wirePick('dotStylePick',v=>state.dotStyle=v); wirePick('cornerStylePick',v=>state.cornerStyle=v); wirePick('cornerDotStylePick',v=>state.cornerDotStyle=v); wirePick('ecPick',v=>state.ecLevel=v);
  const sizeInput=$('f-size'),sizeVal=$('sizeVal'); sizeInput.addEventListener('input',()=>{state.size=Number(sizeInput.value);sizeVal.textContent=state.size;render();});

  const logoInput=$('f-logo'),clearLogo=$('clearLogo'),ecPick=$('ecPick');
  logoInput.addEventListener('change',async()=>{const file=logoInput.files[0];if(!file)return;if(file.size>3*1024*1024){warningBox.hidden=false;warningBox.textContent=QRMO_I18N.t('gen.warn.logoSize');return;}state.logo=await QRMO.readFileAsDataURL(file);clearLogo.hidden=false;if(state.ecLevel!=='H'){state.ecLevel='H';ecPick.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.val==='H'));}render();});
  clearLogo.addEventListener('click',()=>{state.logo=null;logoInput.value='';clearLogo.hidden=true;render();});

  const frameLabelField=$('frameLabelField'),frameLabelInput=$('f-frame-label');
  wirePick('framePick',v=>{state.frame=v;frameLabelField.hidden=v==='none';}); frameLabelInput.addEventListener('input',()=>{state.frameLabel=frameLabelInput.value;scheduleDraftSave();});

  function syncTemplateActive(){
    const same=(tpl)=>tpl &&
      tpl.fg.toLowerCase()===state.fg.toLowerCase() &&
      tpl.bg.toLowerCase()===state.bg.toLowerCase() &&
      tpl.transparent===state.transparent &&
      tpl.gradient.enabled===state.gradient.enabled &&
      tpl.gradient.color2.toLowerCase()===state.gradient.color2.toLowerCase() &&
      tpl.gradient.type===state.gradient.type &&
      tpl.dotStyle===state.dotStyle &&
      tpl.cornerStyle===state.cornerStyle &&
      tpl.cornerDotStyle===state.cornerDotStyle &&
      tpl.ecLevel===state.ecLevel;
    document.querySelectorAll('.template-chip').forEach(b=>b.classList.toggle('active',same(TEMPLATES[b.dataset.template])));
  }
  function syncControls(){
    fg.value=state.fg;fgVal.textContent=state.fg;bg.value=state.bg;bgVal.textContent=state.bg;transparentCk.checked=state.transparent;bg.disabled=state.transparent;
    gradientCk.checked=state.gradient.enabled;gradientOptions.hidden=!state.gradient.enabled;gradient2.value=state.gradient.color2;gradient2Val.textContent=state.gradient.color2;
    document.querySelectorAll('#gradientTypePick button').forEach(b=>b.classList.toggle('active',b.dataset.val===state.gradient.type));
    document.querySelectorAll('#dotStylePick button').forEach(b=>b.classList.toggle('active',b.dataset.val===state.dotStyle));
    document.querySelectorAll('#cornerStylePick button').forEach(b=>b.classList.toggle('active',b.dataset.val===state.cornerStyle));
    document.querySelectorAll('#cornerDotStylePick button').forEach(b=>b.classList.toggle('active',b.dataset.val===state.cornerDotStyle));
    document.querySelectorAll('#ecPick button').forEach(b=>b.classList.toggle('active',b.dataset.val===state.ecLevel));
    document.querySelectorAll('#framePick button').forEach(b=>b.classList.toggle('active',b.dataset.val===state.frame));
    frameLabelField.hidden=state.frame==='none';frameLabelInput.value=state.frameLabel||'';sizeInput.value=state.size;sizeVal.textContent=state.size;clearLogo.hidden=!state.logo;
    syncTemplateActive();
  }

  $('templatePick').addEventListener('click',e=>{const btn=e.target.closest('[data-template]');if(!btn)return;const tpl=TEMPLATES[btn.dataset.template];if(!tpl)return;Object.assign(state,{...tpl,gradient:{...tpl.gradient},logo:state.logo,frame:state.frame,frameLabel:state.frameLabel,size:state.size});document.querySelectorAll('.template-chip').forEach(b=>b.classList.toggle('active',b===btn));syncControls();render();});

  function buildFramedCanvas(canvas){
    if(state.frame==='none')return canvas;const pad=Math.round(canvas.width*.08),barH=Math.round(canvas.width*.16),out=document.createElement('canvas');out.width=canvas.width+pad*2;out.height=canvas.height+pad*2+barH;const ctx=out.getContext('2d');ctx.fillStyle=state.transparent?'#ffffff':state.bg;ctx.fillRect(0,0,out.width,out.height);const qrY=state.frame==='top'?pad+barH:pad;ctx.drawImage(canvas,pad,qrY,canvas.width,canvas.height);const barY=state.frame==='top'?0:out.height-barH;ctx.fillStyle=state.fg;ctx.fillRect(0,barY,out.width,barH);ctx.fillStyle=state.transparent?'#ffffff':state.bg;ctx.font=`700 ${Math.round(barH*.36)}px Cairo, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText((frameLabelInput.value||'').trim()||QRMO_I18N.t('gen.frame.defaultLabel'),out.width/2,barY+barH/2);return out;
  }
  function downloadDataUrl(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();}
  $('dlPng').addEventListener('click',()=>{const canvas=stage.querySelector('canvas');if(state.frame!=='none'&&canvas){downloadDataUrl(buildFramedCanvas(canvas).toDataURL('image/png'),'qrmo.png');return;}QRMO.download(qr,'qrmo','png');});
  $('dlSvg').addEventListener('click',()=>QRMO.downloadAsSvg(currentOptions(),'qrmo'));

  async function renderHighRes(px){
    const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-20000px;top:-20000px;width:1px;height:1px;overflow:hidden;';document.body.appendChild(holder);
    const temp=QRMO.createQR(currentOptions(px),'canvas');temp.append(holder);
    let canvas=null;for(let i=0;i<15;i++){await sleep(40);canvas=holder.querySelector('canvas');if(canvas&&canvas.width>=px*.9)break;}
    if(!canvas){holder.remove();throw new Error('render failed');}
    const out=buildFramedCanvas(canvas);const data=out.toDataURL('image/png');const ratio=out.height/out.width;holder.remove();return{data,ratio};
  }
  function printSettings(){const mm=Math.max(15,Math.min(150,Number($('printSizeMm').value)||40));const dpi=Math.max(72,Math.min(600,Number($('printDpi').value)||300));const px=Math.round(mm/25.4*dpi);return{mm,dpi,px};}
  $('dlPrintPng').addEventListener('click',async()=>{const {px,dpi}=printSettings();const btn=$('dlPrintPng');btn.disabled=true;try{const r=await renderHighRes(px);downloadDataUrl(r.data,`qrmo-${dpi}dpi.png`);}finally{btn.disabled=false;}});
  $('dlPdf').addEventListener('click',async()=>{const {mm,px}=printSettings();const btn=$('dlPdf');btn.disabled=true;try{const r=await renderHighRes(px);if(!window.jspdf?.jsPDF)throw new Error('jsPDF unavailable');const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});const w=mm,h=mm*r.ratio,x=(210-w)/2,y=(297-h)/2;pdf.addImage(r.data,'PNG',x,y,w,h,undefined,'FAST');pdf.save('qrmo-print-a4.pdf');}catch(e){warningBox.hidden=false;warningBox.textContent=QRMO_I18N.t('gen.print.error');}finally{btn.disabled=false;}});
  $('printSheetSingle').addEventListener('click',async()=>{const {px}=printSettings();const btn=$('printSheetSingle');btn.disabled=true;try{const r=await renderHighRes(px);const [cols,rows]=$('printGrid').value.split('x').map(Number);const grid=$('singlePrintGrid');grid.style.setProperty('--print-cols',cols);grid.innerHTML='';for(let i=0;i<cols*rows;i++){const d=document.createElement('div');d.className='print-item';const img=document.createElement('img');img.src=r.data;d.appendChild(img);grid.appendChild(d);}document.body.classList.add('printing-single');window.print();setTimeout(()=>document.body.classList.remove('printing-single'),300);}finally{btn.disabled=false;}});

  // IndexedDB library
  await QRMO_STORE.migrate();
  const savedList=$('savedList'),search=$('librarySearch'),folderInput=$('saveFolder');
  ['printSizeMm','printDpi','printGrid'].forEach(id=>$(id)?.addEventListener('change',scheduleDraftSave));
  folderInput?.addEventListener('input',scheduleDraftSave);
  async function renderLibrary(){
    const q=(search.value||'').trim().toLowerCase();let items=await QRMO_STORE.all();if(q)items=items.filter(i=>`${i.label||''} ${i.folder||''} ${i.type||''}`.toLowerCase().includes(q));savedList.innerHTML='';
    if(!items.length){const li=document.createElement('li');li.className='empty';li.textContent=QRMO_I18N.t('gen.lib.empty');savedList.appendChild(li);return;}
    items.forEach(item=>{const li=document.createElement('li');const meta=document.createElement('div');meta.className='saved-meta';const label=document.createElement('span');label.className='saved-label';label.textContent=item.label;const sub=document.createElement('small');sub.textContent=[item.folder,item.type].filter(Boolean).join(' · ');meta.append(label,sub);const actions=document.createElement('span');actions.className='saved-actions';
      const fav=document.createElement('button');fav.type='button';fav.className='fav-btn';fav.title=QRMO_I18N.t('gen.lib.favorite');fav.textContent=item.favorite?'★':'☆';fav.addEventListener('click',async()=>{item.favorite=!item.favorite;await QRMO_STORE.put(item);renderLibrary();});
      const load=document.createElement('button');load.type='button';load.textContent=QRMO_I18N.t('gen.lib.load');load.addEventListener('click',()=>loadItem(item));
      const dup=document.createElement('button');dup.type='button';dup.textContent=QRMO_I18N.t('gen.lib.duplicate');dup.addEventListener('click',async()=>{await QRMO_STORE.put({...item,id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,label:`${item.label} copy`,createdAt:Date.now()});renderLibrary();});
      const del=document.createElement('button');del.type='button';del.textContent=QRMO_I18N.t('gen.lib.delete');del.addEventListener('click',async()=>{await QRMO_STORE.remove(item.id);renderLibrary();});actions.append(fav,load,dup,del);li.append(meta,actions);savedList.appendChild(li);});
  }
  function loadItem(item){
    switchTab(item.type);applyData(item.type,item.data||{});const st=item.style||{};Object.assign(state,{fg:st.fg||'#211E1A',bg:st.bg||'#fff',transparent:!!st.transparent,gradient:{enabled:!!st.gradient?.enabled,color2:st.gradient?.color2||'#E4894B',type:st.gradient?.type||'linear',rotation:st.gradient?.rotation||0},dotStyle:st.dotStyle||'square',cornerStyle:st.cornerStyle||'square',cornerDotStyle:st.cornerDotStyle||'square',ecLevel:st.ecLevel||'M',size:st.size||300,frame:st.frame||'none',frameLabel:st.frameLabel||'',logo:item.logo||null});folderInput.value=item.folder||'';syncControls();render();}
  $('saveToLibrary').addEventListener('click',async()=>{const data=collectData(),item={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type:state.type,data,label:deriveLabel(state.type,data),folder:(folderInput.value||'').trim(),favorite:false,logo:state.logo,createdAt:Date.now(),style:{fg:state.fg,bg:state.bg,transparent:state.transparent,gradient:{...state.gradient},dotStyle:state.dotStyle,cornerStyle:state.cornerStyle,cornerDotStyle:state.cornerDotStyle,ecLevel:state.ecLevel,size:state.size,frame:state.frame,frameLabel:state.frameLabel}};await QRMO_STORE.put(item);await renderLibrary();});
  search.addEventListener('input',renderLibrary);
  $('exportLibrary').addEventListener('click',async()=>{const text=await QRMO_STORE.exportJson();const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);downloadDataUrl(url,`qrmo-library-${new Date().toISOString().slice(0,10)}.json`);setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('importLibrary').addEventListener('change',async()=>{const f=$('importLibrary').files[0];if(!f)return;try{await QRMO_STORE.importJson(await f.text());await renderLibrary();}catch(e){warningBox.hidden=false;warningBox.textContent=QRMO_I18N.t('gen.lib.importError');}$('importLibrary').value='';});
  document.addEventListener('qrmo:langchange',()=>{renderLibrary();updateHealth(currentOptions(),lastReadable);});

  restoreDraft();
  const requested=new URLSearchParams(location.search).get('type');
  if(requested&&FIELD_MAP[requested]&&requested!==state.type){switchTab(requested);}
  syncControls();render();await renderLibrary();
});
