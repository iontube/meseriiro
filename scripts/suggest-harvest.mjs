#!/usr/bin/env node
// Culege Google Autosuggest RO pentru universul "salarii / meserii" si il incruciseaza cu GSC.
// Model dupa /sites/centrocasa-work/scripts/kw-explorer.mjs (acelasi endpoint + throttling).
import fs from 'fs';

const SUGGEST = 'https://suggestqueries.google.com/complete/search';
const OUT = '/sites/meseriiro-work/research/suggest_raw.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function suggest(q, tries = 3) {
  const url = `${SUGGEST}?client=firefox&hl=ro&gl=ro&q=${encodeURIComponent(q)}`;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (!r.ok) { await sleep(600 * (i + 1)); continue; }
      const arr = JSON.parse(await r.text());
      return Array.isArray(arr?.[1]) ? arr[1] : [];
    } catch { await sleep(600 * (i + 1)); }
  }
  return [];
}

// --- seeduri -------------------------------------------------------------
const meserii = JSON.parse(fs.readFileSync('/sites/meseriiro-work/src/data/meserii.json', 'utf8'));
const gsc = JSON.parse(fs.readFileSync('/sites/meseriiro-work/research/gsc_queries.json', 'utf8'));

// meseriile cu cele mai multe impresii in GSC (potrivim numele in query-uri)
const impr = {};
for (const m of meserii) {
  const n = m.nume.toLowerCase();
  const key = n.split(/\s+/).slice(0, 2).join(' ');
  impr[m.nume] = gsc.filter(r => r.keys[0].includes(key)).reduce((a, r) => a + r.impressions, 0);
}
const topMeserii = Object.entries(impr).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([n]) => n);

// capete generice = cererea "de portal", nu per-meserie
const HEADS = [
  'salariu', 'salarii', 'cat castiga un', 'cat castiga o', 'ce salariu are un',
  'cea mai bine platita meserie', 'meserii', 'meserii bine platite', 'meserii fara facultate',
  'meserii de viitor', 'cele mai cautate meserii', 'salariu mediu', 'salariu minim',
  'reconversie profesionala', 'ce meserie sa aleg', 'cursuri calificare',
];
const LETTERS = 'abcdefgilmnoprstuv'.split('');
const PATTERNS = ['salariu {}', 'cat castiga un {}', '{} salariu', '{} salariu romania', 'cum devii {}', '{} cursuri'];

const seen = new Map(); // termen -> {surse:Set, rank total, n}
function add(term, src, rank) {
  const t = term.toLowerCase().trim();
  if (!t) return;
  const e = seen.get(t) || { srcs: new Set(), rankSum: 0, n: 0 };
  e.srcs.add(src); e.rankSum += rank; e.n++;
  seen.set(t, e);
}

const queue = [];
for (const h of HEADS) { queue.push([h, 'head']); for (const L of LETTERS) queue.push([`${h} ${L}`, 'head-alpha']); }
for (const m of topMeserii) for (const p of PATTERNS) queue.push([p.replace('{}', m.toLowerCase()), 'meserie']);

console.error(`[suggest] ${queue.length} interogari...`);
let done = 0;
for (const [qy, src] of queue) {
  const res = await suggest(qy);
  res.forEach((t, i) => add(t, src, i + 1));
  if (++done % 50 === 0) console.error(`  ${done}/${queue.length} — ${seen.size} termeni`);
  await sleep(120);
}

const rows = [...seen.entries()].map(([t, e]) => ({
  termen: t, depth: e.n, rankMed: +(e.rankSum / e.n).toFixed(1), srcs: [...e.srcs],
}));
fs.writeFileSync(OUT, JSON.stringify(rows, null, 0));
console.error(`[suggest] ${rows.length} termeni unici -> ${OUT}`);
