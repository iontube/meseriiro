import fs from 'fs';
const D = '/sites/meseriiro-work/research';
const sug = JSON.parse(fs.readFileSync(`${D}/suggest_raw.json`, 'utf8'));
const gsc = JSON.parse(fs.readFileSync(`${D}/gsc_queries.json`, 'utf8'));
const meserii = JSON.parse(fs.readFileSync('/sites/meseriiro-work/src/data/meserii.json', 'utf8'));
const orase = JSON.parse(fs.readFileSync('/sites/meseriiro-work/src/data/orase.json', 'utf8'));

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const gscMap = new Map(gsc.map(r => [norm(r.keys[0]), r]));
const numeSet = meserii.map(m => ({ nume: norm(m.nume), slug: m.slug }));
const oraseSet = new Set(orase.map(o => norm(typeof o === 'string' ? o : (o.nume || o.name || ''))));

// avem pagina pentru termen? (contine numele unei meserii din catalog)
function coverage(t) {
  const n = norm(t);
  const hit = numeSet.find(m => n.includes(m.nume));
  return hit ? hit.slug : null;
}
const isSalaryIntent = t => /salar|castig|plat|venit|bani|cat ia|leafa/.test(norm(t));

const rows = sug.map(s => {
  const n = norm(s.termen);
  const g = gscMap.get(n);
  return { ...s, n, gClicks: g?.clicks ?? null, gImpr: g?.impressions ?? null, gPos: g?.position ?? null,
           cov: coverage(s.termen), sal: isSalaryIntent(s.termen) };
});

const inGsc = rows.filter(r => r.gImpr !== null);
console.log('=== ACOPERIRE GENERALA ===');
console.log('termeni din suggest:', rows.length);
console.log('  care apar in GSC (avem macar 1 impresie):', inGsc.length, `(${(inGsc.length/rows.length*100).toFixed(1)}%)`);
console.log('  cu intentie de salariu:', rows.filter(r => r.sal).length);
console.log('  care se potrivesc cu o meserie din catalog:', rows.filter(r => r.cov).length);
console.log('  intentie salariu + meserie in catalog + ZERO impresii GSC:', rows.filter(r => r.sal && r.cov && r.gImpr === null).length);

console.log('\n=== A. CERERE REALA, ZERO VIZIBILITATE (avem pagina, dar 0 impresii) — top 40 dupa depth ===');
const gap = rows.filter(r => r.cov && r.gImpr === null && r.sal).sort((a, b) => b.depth - a.depth || a.rankMed - b.rankMed);
for (const r of gap.slice(0, 40)) console.log(String(r.depth).padStart(3), 'rank', String(r.rankMed).padStart(5), '|', r.termen.padEnd(52), '| /salariu/' + r.cov + '/');
console.log('total in categoria asta:', gap.length);

console.log('\n=== B. CERERE REALA, NU AVEM PAGINA (nici meserie in catalog) — top 40 ===');
const nocov = rows.filter(r => !r.cov && r.gImpr === null && r.depth >= 2).sort((a, b) => b.depth - a.depth || a.rankMed - b.rankMed);
for (const r of nocov.slice(0, 40)) console.log(String(r.depth).padStart(3), 'rank', String(r.rankMed).padStart(5), '|', r.termen);
console.log('total:', nocov.length);

console.log('\n=== C. AVEM IMPRESII DAR POZITIE SLABA (suggest ∩ GSC, poz > 5) ===');
const weak = inGsc.filter(r => r.gPos > 5).sort((a, b) => b.gImpr - a.gImpr);
for (const r of weak.slice(0, 30)) console.log(String(r.gImpr).padStart(5), 'cl', String(r.gClicks).padStart(3), 'poz', r.gPos.toFixed(1).padStart(5), '| depth', String(r.depth).padStart(2), '|', r.termen);
console.log('total:', weak.length);

console.log('\n=== D. TERMENI-CAP (head) fara meserie — teme de articol/hub ===');
const heads = rows.filter(r => r.srcs.includes('head') || r.srcs.includes('head-alpha')).filter(r => !r.cov).sort((a, b) => b.depth - a.depth);
for (const r of heads.slice(0, 45)) console.log(String(r.depth).padStart(3), 'rank', String(r.rankMed).padStart(5), '|', (r.gImpr !== null ? `GSC:${r.gImpr}i/${r.gClicks}c/poz${r.gPos.toFixed(0)}` : 'GSC: —').padEnd(24), '|', r.termen);

fs.writeFileSync(`${D}/cross.json`, JSON.stringify(rows, null, 0));
