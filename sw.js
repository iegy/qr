// qrmo v2 service worker — offline-first static toolkit.
const CACHE_VERSION='qrmo-v2.0.1';
const PRECACHE_URLS=[
  './','index.html','generator.html','batch.html','scanner.html','about.html',
  'style.css','qr-core.js','storage.js','main.js','i18n.js','home.js','generator.js','batch.js','scanner.js',
  'manifest.json','favicon.svg','favicon-32.png','icon-192.png','icon-512.png','icon-512-maskable.png','apple-touch-icon.png','og-image.png',
  'en/','en/index.html','en/generator.html','en/batch.html','en/scanner.html','en/about.html'
];
const CDN_URLS=[
  'https://cdn.jsdelivr.net/npm/qr-code-styling@1.9.2/lib/qr-code-styling.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_VERSION);
    await cache.addAll(PRECACHE_URLS);
    await Promise.allSettled(CDN_URLS.map(async url=>{
      const res=await fetch(url,{mode:'cors'});
      if(res.ok) await cache.put(url,res);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);
  if(CDN_URLS.includes(req.url)){
    event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_VERSION).then(c=>c.put(req,copy));return res;})));
    return;
  }
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html')){
    event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_VERSION).then(c=>c.put(req,copy));return res;}).catch(()=>caches.match(req).then(c=>c||caches.match(url.pathname.includes('/en/')?'en/index.html':'index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>{const network=fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_VERSION).then(c=>c.put(req,copy));return res;}).catch(()=>cached);return cached||network;}));
});
