#!/usr/bin/env node
// Validează că linkurile contextuale din articole către pagini-oraș (/salariu/<meserie>/<oras>/)
// trimit DOAR către pagini indexate (cele din src/data/city-indexed.json).
// Paginile-oraș fără trafic GSC sunt noindex → nu linkăm contextual spre ele.
// Rulează înainte de publicare:  node scripts/check-article-city-links.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexed = new Set(JSON.parse(fs.readFileSync(path.join(root, 'src/data/city-indexed.json'), 'utf8')).keys);
const dir = path.join(root, 'src/content/articole');

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.md') || f.endsWith('.mdx')) files.push(p);
  }
})(dir);

const re = /\/salariu\/([a-z0-9-]+)\/([a-z0-9-]+)\/?/g;
let total = 0;
const bad = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(line))) {
      total++;
      const key = `${m[1]}/${m[2]}`;
      if (!indexed.has(key)) bad.push({ file: path.relative(root, f), line: i + 1, link: m[0], key });
    }
  });
}

console.log(`Articole: ${files.length} | linkuri către pagini-oraș: ${total} | indexate disponibile: ${indexed.size}`);
if (bad.length === 0) {
  console.log('✅ Toate linkurile contextuale trimit către pagini INDEXATE.');
  process.exit(0);
}
console.log(`\n❌ ${bad.length} link(uri) către pagini NOINDEX — schimbă-le cu un oraș indexat sau cu /salariu/<meserie>/:`);
for (const b of bad) console.log(`   ${b.file}:${b.line}  →  ${b.link}`);
process.exit(1);
