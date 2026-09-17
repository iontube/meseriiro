// Submit meseriile.ro URLs to Bing via IndexNow (key-based, no account). Bing-only endpoint.
// Modelat după /sites/pretulverde.ro/build/indexnow_submit.mjs, dar citește sitemap-urile
// LOCALE din dist/ (site static pe CF Pages, fără origin server).
//   env: DIST (default /sites/meseriiro-work/dist) | MAXURLS (cap, default toate) | DELAY ms (default 1000)
// Rulează după fiecare build+deploy:  node scripts/indexnow_submit.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import https from 'node:https';

const HOST = 'meseriile.ro';
const KEY = '4ac47e7ee8490200e248328233b2e24a';
const KEYLOC = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://www.bing.com/indexnow';
const DELAY = +(process.env.DELAY || 1000);
const DIST = process.env.DIST || '/sites/meseriiro-work/dist';
const MAXURLS = +(process.env.MAXURLS || 1e9);

const locs = (xml) => (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map((m) => m.slice(5, -6));

// Fișierele-sitemap cu URL-uri de PAGINĂ (NU sitemap-index.xml, care listează alte sitemap-uri).
function sitemapFiles() {
  const files = [];
  try { for (const f of readdirSync(join(DIST, 'sitemaps'))) if (f.endsWith('.xml')) files.push(join(DIST, 'sitemaps', f)); } catch {}
  try { for (const f of readdirSync(DIST)) if (/^sitemap-articole.*\.xml$/.test(f)) files.push(join(DIST, f)); } catch {}
  return files;
}

const submit = (urlList) => new Promise((res) => {
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEYLOC, urlList });
  const req = https.request(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res({ status: r.statusCode, body: d.slice(0, 160) })); });
  req.on('error', (e) => res({ status: 0, body: String(e) }));
  req.write(body); req.end();
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Colectează + dedup toate URL-urile
const seen = new Set();
for (const f of sitemapFiles()) {
  for (const u of locs(readFileSync(f, 'utf-8'))) {
    if (u.startsWith(`https://${HOST}/`) && !seen.has(u)) seen.add(u);
    if (seen.size >= MAXURLS) break;
  }
  if (seen.size >= MAXURLS) break;
}
const all = [...seen];
console.log(`${new Date().toISOString()} IndexNow→Bing ${HOST}: ${all.length} URL de trimis (batch 10k, delay ${DELAY}ms)`);

let submitted = 0, ok = 0;
for (let i = 0; i < all.length; i += 10000) {
  const batch = all.slice(i, i + 10000);
  const r = await submit(batch);
  submitted += batch.length; if (r.status === 200 || r.status === 202) ok += batch.length;
  console.log(`  batch ${batch.length} -> ${r.status} ${r.body} (total ${submitted}, ok ${ok})`);
  if (i + 10000 < all.length) await sleep(DELAY);
}
console.log(`${new Date().toISOString()} DONE submitted=${submitted} accepted=${ok}`);
