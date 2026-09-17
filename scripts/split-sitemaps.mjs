/**
 * Post-build script: splits the single large sitemap into chunks of 1000 URLs.
 * Generates: dist/sitemaps/sitemap-001.xml, sitemap-002.xml, ...
 * Generates: dist/sitemap-index.xml referencing ALL chunks.
 * A separate script (drip-sitemap-index.mjs) controls how many are visible.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const sitemapsDir = resolve(distDir, 'sitemaps');
const URLS_PER_SITEMAP = 1000;
const SITE_URL = 'https://meseriile.ro';

// Read the generated sitemap
const sitemapPath = resolve(distDir, 'sitemap-0.xml');
if (!existsSync(sitemapPath)) {
  console.error('sitemap-0.xml not found in dist/. Run astro build first.');
  process.exit(1);
}

const xml = readFileSync(sitemapPath, 'utf-8');

// Extract all <url>...</url> blocks
const urlBlocks = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map(m => m[0]);
console.log(`Found ${urlBlocks.length} URLs in sitemap-0.xml`);

// GARDA: sitemap-0.xml e golit la finalul acestui script, deci o a doua rulare fara
// `astro build` inainte ar gasi 0 URL si ar rescrie indexul cu zero sitemap-uri, adica
// i-ar retrage lui Google tot site-ul. Iesim inainte sa atingem ceva.
if (urlBlocks.length === 0) {
  console.error('EROARE: 0 URL in sitemap-0.xml. Ruleaza `astro build` inainte de split-sitemaps.');
  console.error('Nu am modificat niciun sitemap.');
  process.exit(1);
}

// Split into chunks
const chunks = [];
for (let i = 0; i < urlBlocks.length; i += URLS_PER_SITEMAP) {
  chunks.push(urlBlocks.slice(i, i + URLS_PER_SITEMAP));
}
console.log(`Splitting into ${chunks.length} sitemaps (${URLS_PER_SITEMAP} URLs each)`);

// Create sitemaps dir
mkdirSync(sitemapsDir, { recursive: true });

// Extract XML namespaces from original
const nsMatch = xml.match(/<urlset([^>]*)>/);
const namespaces = nsMatch ? nsMatch[1] : ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

// Write each chunk
// lastmod DETERMINIST: extras din <lastmod>-urile URL-urilor (setat fix în astro.config),
// NU ora build-ului — ca sitemap-urile nemodificate să-și păstreze data.
const urlLastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]).sort();
const now = urlLastmods.length ? urlLastmods[urlLastmods.length - 1] : new Date().toISOString();
for (let i = 0; i < chunks.length; i++) {
  const num = String(i + 1).padStart(3, '0');
  const filename = `sitemap-${num}.xml`;
  const content = `<?xml version="1.0" encoding="UTF-8"?><urlset${namespaces}>${chunks[i].join('')}</urlset>`;
  writeFileSync(resolve(sitemapsDir, filename), content);
  console.log(`  ${filename}: ${chunks[i].length} URLs`);
}

// Write full sitemap-index.xml (references ALL sitemaps)
const fullIndex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${chunks.map((_, i) => {
  const num = String(i + 1).padStart(3, '0');
  return `<sitemap><loc>${SITE_URL}/sitemaps/sitemap-${num}.xml</loc><lastmod>${now}</lastmod></sitemap>`;
}).join('')}</sitemapindex>`;

writeFileSync(resolve(distDir, 'sitemap-index-full.xml'), fullIndex);

// sitemap-index.xml = indexul pe care il vede Google (robots.txt trimite catre el).
// Il scriem COMPLET aici, ca un `npm run build` simplu sa produca un index valid.
// `npm run build:drip` il rescrie dupa aceea cu subsetul zilei, deci dripul ramane intact.
writeFileSync(resolve(distDir, 'sitemap-index.xml'), fullIndex);

// Write metadata for drip script
const meta = {
  totalSitemaps: chunks.length,
  urlsPerSitemap: URLS_PER_SITEMAP,
  totalUrls: urlBlocks.length,
  generatedAt: now,
};
writeFileSync(resolve(distDir, 'sitemaps/meta.json'), JSON.stringify(meta, null, 2));

// Sitemapul mare generat de Astro nu mai e referit de nimeni dupa split. Il STERGEM,
// ca sa nu ramana un fisier gol servit cu 200 pe care Google l-ar putea reciti.
unlinkSync(resolve(distDir, 'sitemap-0.xml'));

console.log(`\nDone! ${chunks.length} sitemaps in dist/sitemaps/`);
console.log('Run: node scripts/drip-sitemap-index.mjs [day_number]');
