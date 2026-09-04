const CACHE='trafinexo-shell-v2';
const SHELL=['/','/manifest.webmanifest'];
const STATIC_RE=/\.(?:svg|png|jpg|jpeg|webp|css|js|woff2?)$/i;
const SENSITIVE=['/api/','/login','/cadastro','/dashboard','/admin','/dev','/integracoes','/campanhas','/clientes','/financeiro'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>undefined));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==location.origin)return;if(SENSITIVE.some(prefix=>url.pathname.startsWith(prefix))||url.pathname.includes('supabase')||req.headers.get('authorization'))return;if(req.mode==='navigate'){event.respondWith(fetch(req).catch(()=>caches.match('/')));return}if(url.pathname.startsWith('/_next/static/')||STATIC_RE.test(url.pathname)){event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok&&res.type==='basic'){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>undefined)}return res})))}});
