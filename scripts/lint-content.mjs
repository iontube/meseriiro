/**
 * lint-content.mjs — filtru anti-clișeu / anti-AI-slop pentru articolele de blog.
 *
 * Rulează:  npm run lint         (raportează)
 *           npm run lint -- --strict   (exit 1 la orice HARD → gate în build)
 *
 * Verifică fiecare src/content/blog/*.md pentru:
 *  - clișee de structură/limbaj (ghid, concluzie, peisaj, "hai să", etc.)
 *  - em-dash / en-dash (— –) — interzise complet în corp
 *  - titluri cu adăugiri de tip AI ("ghid complet", "tot ce trebuie să știi", ":", etc.)
 *  - lungime în afara intervalului 1500–3000 cuvinte
 *
 * Matching insensibil la diacritice și majuscule.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'articole');
const STRICT = process.argv.includes('--strict');

// walk recursiv (articolele stau în subfoldere = categorii)
function walkMd(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walkMd(p));
    else if (e.endsWith('.md')) out.push(p);
  }
  return out;
}

const deaccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

// --- Clișee interzise în CORP (frază normalizată, fără diacritice) ---
const BANNED_BODY = [
  // structură / meta
  'ghid', 'ghiduri', 'ghidul', 'in concluzie', 'concluzie', 'pentru a concluziona',
  'in acest articol', 'in randurile de mai jos', 'in cele ce urmeaza',
  'sa exploram', 'hai sa', 'haideti sa', 'sa aruncam o privire', 'sa vedem impreuna',
  'in cele din urma', 'la finalul zilei', 'in final', 'asadar', 'prin urmare', 'drept urmare',
  // hype / verbe AI
  'descopera', 'dezvaluie', 'deblocheaza', 'transforma-ti', 'revolutioneaza', 'redefineste',
  'imbratiseaza', 'valorifica', 'navigheaza prin', 'porneste in aceasta calatorie',
  'calatoria ta', 'in aceasta calatorie', 'deblocheaza-ti potentialul',
  // metafore-clișeu
  'peisajul', 'in peisaj', 'in era digitala', 'in lumea moderna', 'in lumea de azi',
  'in ziua de azi', 'in zilele noastre', 'in societatea actuala', 'lumea fascinanta',
  'universul', 'cheia succesului', 'secretul succesului', 'reteta succesului',
  // umplutură / connective clișeice
  'merita mentionat', 'este important de mentionat', 'este important de retinut',
  'trebuie subliniat', 'demn de mentionat', 'nu putem sa nu', 'fara doar si poate',
  'cand vine vorba de', 'joaca un rol crucial', 'joaca un rol esential', 'joaca un rol vital',
  'de nepretuit', 'indispensabil', 'fara indoiala', 'cu siguranta ca',
  'tot ce trebuie sa stii', 'tot ce ai nevoie', 'solutie completa', 'gama larga', 'o gama variata',
  'pas cu pas', 'pasi simpli', 'pasi usori', 'fie ca esti', 'indiferent daca esti',
  // English AI-tells (dacă se strecoară)
  'delve', 'tapestry', 'testament', 'realm', 'seamless', 'game-changer', 'cutting-edge',
  'unlock', 'harness', 'whether you are', 'in todays world', 'navigate the',
];

// --- Reguli pt TITLU (frază normalizată) ---
const BANNED_TITLE = [
  'ghid', 'complet', 'tot ce trebuie sa stii', 'tot ce trebuie sa stiti',
  'pas cu pas', 'de la zero', 'secretele', 'secretul', 'ultimate', 'definitiv',
  'in 2024', // titluri hard-codate pe an vechi
];

// avertismente (nu hard fail): hyphen spațiat folosit ca dash, connective supra-uzate
const WARN_BODY = [' - ', 'de asemenea', 'totodata', 'mai mult decat atat', 'in plus,'];

function parse(md) {
  // separă frontmatter
  let title = '';
  let body = md;
  let faqText = '';
  const fm = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (fm) {
    const t = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    title = t ? t[1] : '';
    body = fm[2];
    // FAQ din frontmatter (q:/a:) = conținut real pe pagină → se numără și se scanează
    faqText = [...fm[1].matchAll(/^\s*[qa]:\s*["']?(.+?)["']?\s*$/gm)].map((m) => m[1]).join('\n');
  }
  // elimină blocuri de cod
  body = body.replace(/```[\s\S]*?```/g, '');
  return { title, body, faqText };
}

function scanLines(text, terms) {
  const hits = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const norm = deaccent(line.toLowerCase());
    for (const term of terms) {
      const t = deaccent(term.toLowerCase());
      // boundary simplu pt cuvinte alfanumerice; frazele conțin spații → substring
      const re = /\s/.test(t)
        ? new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        : new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      if (re.test(norm)) hits.push({ line: i + 1, term });
    }
  });
  return hits;
}

function wordCount(body) {
  return body.replace(/[#>*_`\[\]()!|-]/g, ' ').split(/\s+/).filter(Boolean).length;
}

const files = walkMd(DIR).map((abs) => relative(DIR, abs));
let hardTotal = 0;
let warnTotal = 0;

for (const f of files) {
  const md = readFileSync(join(DIR, f), 'utf-8');
  const { title, body, faqText } = parse(md);
  const scanText = faqText ? `${body}\n${faqText}` : body;
  const problems = [];

  // em/en dash oriunde în corp + FAQ
  scanText.split('\n').forEach((line, i) => {
    if (/[—–]/.test(line)) problems.push({ sev: 'HARD', line: i + 1, msg: `em/en-dash interzis: "${line.trim().slice(0, 50)}"` });
  });

  scanLines(scanText, BANNED_BODY).forEach((h) =>
    problems.push({ sev: 'HARD', line: h.line, msg: `clișeu în corp: "${h.term}"` }));

  // titlu
  if (/[—–:]/.test(title)) problems.push({ sev: 'HARD', line: 0, msg: `titlu cu ":"/dash (adăugire AI): "${title}"` });
  scanLines(title, BANNED_TITLE).forEach((h) =>
    problems.push({ sev: 'HARD', line: 0, msg: `clișeu în titlu: "${h.term}"` }));

  // lungime (corp + FAQ)
  const wc = wordCount(scanText);
  if (wc < 1500) problems.push({ sev: 'HARD', line: 0, msg: `prea scurt: ${wc} cuvinte (min 1500)` });
  else if (wc > 3000) problems.push({ sev: 'WARN', line: 0, msg: `peste țintă: ${wc} cuvinte (max ~3000)` });

  scanLines(scanText, WARN_BODY).forEach((h) =>
    problems.push({ sev: 'WARN', line: h.line, msg: `de verificat: "${h.term.trim()}"` }));

  const hard = problems.filter((p) => p.sev === 'HARD');
  const warn = problems.filter((p) => p.sev === 'WARN');
  hardTotal += hard.length;
  warnTotal += warn.length;

  if (problems.length === 0) {
    console.log(`✓ ${f}  (${wc} cuvinte) — curat`);
  } else {
    console.log(`\n✗ ${f}  (${wc} cuvinte) — ${hard.length} HARD, ${warn.length} WARN`);
    for (const p of problems.sort((a, b) => a.line - b.line)) {
      const loc = p.line ? `L${p.line}` : 'meta';
      console.log(`   [${p.sev}] ${loc}: ${p.msg}`);
    }
  }
}

console.log(`\n──────────\nTOTAL: ${hardTotal} HARD, ${warnTotal} WARN în ${files.length} fișiere.`);
if (STRICT && hardTotal > 0) {
  console.log('STRICT: build blocat până rezolvi HARD.');
  process.exit(1);
}
