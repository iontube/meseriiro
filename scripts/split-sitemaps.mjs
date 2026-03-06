/**
 * Post-build script: splits the single large sitemap into chunks of 1000 URLs.
 * Generates: dist/sitemaps/sitemap-001.xml, sitemap-002.xml, ...
 * Generates: dist/sitemap-index.xml referencing ALL chunks.
 * A separate script (drip-sitemap-index.mjs) controls how many are visible.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
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
const now = new Date().toISOString();
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

// Write metadata for drip script
const meta = {
  totalSitemaps: chunks.length,
  urlsPerSitemap: URLS_PER_SITEMAP,
  totalUrls: urlBlocks.length,
  generatedAt: now,
};
writeFileSync(resolve(distDir, 'sitemaps/meta.json'), JSON.stringify(meta, null, 2));

// Remove original large sitemap
writeFileSync(resolve(distDir, 'sitemap-0.xml'), '');

console.log(`\nDone! ${chunks.length} sitemaps in dist/sitemaps/`);
console.log('Run: node scripts/drip-sitemap-index.mjs [day_number]');
