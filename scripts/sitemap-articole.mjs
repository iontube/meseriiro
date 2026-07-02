/**
 * Post-build: sitemap dedicat pentru /articole/*, max 200 URL/fișier,
 * cu <image:image> pentru fiecare imagine din articol (de pe img.meseriile.ro).
 * Adaugă sitemap-urile de articole în ACELAȘI dist/sitemap-index.xml.
 *
 * Rulează DUPĂ split-sitemaps + drip (care scriu sitemap-index.xml).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, '../dist');
const sitemapsDir = resolve(dist, 'sitemaps');
const SITE = 'https://meseriile.ro';
const PER_FILE = 200;
const now = new Date().toISOString();

const articoleDir = resolve(dist, 'articole');
if (!existsSync(articoleDir)) {
  console.log('[sitemap-articole] dist/articole/ inexistent, sar peste.');
  process.exit(0);
}

const xmlEsc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// walk recursiv după index.html
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (e === 'index.html') out.push(p);
  }
  return out;
}

const pages = walk(articoleDir).map((file) => {
  const rel = file.slice(dist.length).replace(/\/index\.html$/, '/').replace(/\\/g, '/');
  const loc = SITE + rel;
  const html = readFileSync(file, 'utf-8');
  // Doar imaginile PROPRII paginii: folderul imaginii === calea paginii.
  // Exclude thumbnail-urile altor articole (din carduri similare/liste).
  const ownPrefix = 'https://img.meseriile.ro' + rel; // ex .../articole/<cat>/<slug>/
  const all = [...new Set([...html.matchAll(/https:\/\/img\.meseriile\.ro\/[^\s"'<>)]+/g)].map((m) => m[0]))];
  const imgs = all.filter((u) => u.slice(0, u.lastIndexOf('/') + 1) === ownPrefix);
  // lastmod CINSTIT = data reală a articolului. Doar paginile de ARTICOL (cu
  // article:published_time) au dată proprie; hub/index (fără) => data celui mai nou articol,
  // NU build-time-ul emis de SEOHead ca article:modified_time.
  const isArticle = /article:published_time/.test(html);
  const mt = html.match(/article:modified_time"\s+content="([^"]+)"/);
  const lastmod = isArticle && mt ? mt[1] : null;
  return { loc, imgs, lastmod };
});

// pt hub/index (fără article:modified_time) folosim cea mai recentă dată de articol
const newest = pages.map((p) => p.lastmod).filter(Boolean).sort().pop() || now;

// ordonează: articolele (cu imagini) primele, cel mai NOU articol primul (lastmod desc),
// apoi hub/index/paginare (fără lastmod propriu) la final, alfabetic.
pages.sort(
  (a, b) =>
    (b.imgs.length > 0 ? 1 : 0) - (a.imgs.length > 0 ? 1 : 0) ||
    (b.lastmod || '').localeCompare(a.lastmod || '') ||
    a.loc.localeCompare(b.loc),
);

const chunks = [];
for (let i = 0; i < pages.length; i += PER_FILE) chunks.push(pages.slice(i, i + PER_FILE));

mkdirSync(sitemapsDir, { recursive: true });
const NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
const files = [];
chunks.forEach((chunk, i) => {
  const num = String(i + 1).padStart(3, '0');
  const fname = `sitemap-articole-${num}.xml`;
  const body = chunk
    .map((p) => {
      const images = p.imgs.map((u) => `<image:image><image:loc>${xmlEsc(u)}</image:loc></image:image>`).join('');
      return `<url><loc>${xmlEsc(p.loc)}</loc><lastmod>${p.lastmod || newest}</lastmod>${images}</url>`;
    })
    .join('');
  writeFileSync(resolve(sitemapsDir, fname), `<?xml version="1.0" encoding="UTF-8"?><urlset ${NS}>${body}</urlset>`);
  files.push(fname);
  console.log(`  ${fname}: ${chunk.length} URL, ${chunk.reduce((s, p) => s + p.imgs.length, 0)} imagini`);
});

// adaugă sitemap-urile de articole în index(uri)
const entries = files
  .map((f) => `<sitemap><loc>${SITE}/sitemaps/${f}</loc><lastmod>${newest}</lastmod></sitemap>`)
  .join('');

for (const idxName of ['sitemap-index.xml', 'sitemap-index-full.xml']) {
  const idxPath = resolve(dist, idxName);
  if (!existsSync(idxPath)) continue;
  let idx = readFileSync(idxPath, 'utf-8');
  // scoate eventuale intrări vechi de articole (idempotent)
  idx = idx.replace(/<sitemap><loc>[^<]*sitemap-articole-[^<]*<\/loc>.*?<\/sitemap>/g, '');
  idx = idx.replace('</sitemapindex>', `${entries}</sitemapindex>`);
  writeFileSync(idxPath, idx);
  console.log(`  + ${files.length} sitemap-uri de articole adăugate în ${idxName}`);
}

console.log(`[sitemap-articole] ${pages.length} URL în ${chunks.length} fișiere.`);
