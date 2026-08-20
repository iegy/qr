/* qrmo — IndexedDB saved-code library with localStorage fallback + v1 migration. */
const QRMO_STORE = (() => {
  const DB_NAME='qrmo-v2';
  const STORE='codes';
  const LEGACY='qrmo-saved-codes';
  let dbPromise=null;

  function open(){
    if (!('indexedDB' in window)) return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if (!db.objectStoreNames.contains(STORE)){
          const s=db.createObjectStore(STORE,{keyPath:'id'});
          s.createIndex('createdAt','createdAt');
          s.createIndex('folder','folder');
          s.createIndex('favorite','favorite');
        }
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
    });
    return dbPromise;
  }

  async function idbTx(mode, fn){
    const db=await open();
    if (!db) return null;
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,mode); const s=tx.objectStore(STORE);
      let out;
      try{ out=fn(s); }catch(e){ reject(e); return; }
      tx.oncomplete=()=>resolve(out); tx.onerror=()=>reject(tx.error);
    });
  }

  function fallbackLoad(){
    try{ return JSON.parse(localStorage.getItem('qrmo-v2-fallback')||'[]'); }catch(e){ return []; }
  }
  function fallbackSave(items){ localStorage.setItem('qrmo-v2-fallback',JSON.stringify(items)); }

  async function all(){
    const db=await open();
    if (!db) return fallbackLoad().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    return new Promise((resolve)=>{
      const tx=db.transaction(STORE,'readonly'); const req=tx.objectStore(STORE).getAll();
      req.onsuccess=()=>resolve((req.result||[]).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)));
      req.onerror=()=>resolve([]);
    });
  }
  async function put(item){
    item={...item,updatedAt:Date.now()};
    const db=await open();
    if (!db){ const items=fallbackLoad(); const i=items.findIndex(x=>x.id===item.id); if(i>=0)items[i]=item;else items.unshift(item); fallbackSave(items); return item; }
    await idbTx('readwrite',s=>s.put(item)); return item;
  }
  async function remove(id){
    const db=await open();
    if (!db){ fallbackSave(fallbackLoad().filter(x=>x.id!==id)); return; }
    await idbTx('readwrite',s=>s.delete(id));
  }
  async function clear(){
    const db=await open();
    if (!db){ fallbackSave([]); return; }
    await idbTx('readwrite',s=>s.clear());
  }
  async function migrate(){
    let legacy=[]; try{ legacy=JSON.parse(localStorage.getItem(LEGACY)||'[]'); }catch(e){}
    if (!legacy.length) return;
    for (const old of legacy){
      await put({
        id:old.id||`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        type:old.type||'link', data:old.data||{}, label:old.label||'QR', style:old.style||{},
        logo:null, folder:'', favorite:false, createdAt:Date.now()
      });
    }
    localStorage.removeItem(LEGACY);
  }
  async function exportJson(){ return JSON.stringify({version:2,exportedAt:new Date().toISOString(),codes:await all()},null,2); }
  async function importJson(text){
    const parsed=JSON.parse(text); const codes=Array.isArray(parsed)?parsed:parsed.codes;
    if(!Array.isArray(codes)) throw new Error('Invalid backup');
    for(const item of codes){ if(item && item.id) await put(item); }
    return codes.length;
  }

  return { all, put, remove, clear, migrate, exportJson, importJson };
})();
