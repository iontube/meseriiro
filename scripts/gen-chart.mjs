/**
 * Generează charturi SVG (bare orizontale) din datele directorului.
 * Inline în articole (0 fișiere, crisp, responsive). Rulează: node scripts/gen-chart.mjs <slug>
 * Scrie SVG-urile în /tmp/chart-<slug>-*.svg pt inserare în markdown.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const meserii = JSON.parse(readFileSync(resolve(__dirname, '../src/data/meserii.json'), 'utf-8'));
const orase = JSON.parse(readFileSync(resolve(__dirname, '../src/data/orase.json'), 'utf-8'));
const oraseNume = Object.fromEntries(orase.map((o) => [o.id, o.nume]));

const slug = process.argv[2] || 'sudor';
const m = meserii.find((x) => x.slug === slug);
if (!m) { console.error('meserie inexistentă:', slug); process.exit(1); }

const lei = (n) => n.toLocaleString('ro-RO');
const BRAND = '#c43d22', BRAND_LT = '#f07550', TXT = '#292524', MUT = '#78716c', GRID = '#e8e4dd';

/** bare orizontale, responsive (viewBox), etichete + valori */
function barChart({ title, items, unit = 'lei/lună' }) {
  const W = 720, rowH = 58, padT = 78, padB = 28, padL = 196, padR = 118;
  const H = padT + items.length * rowH + padB;
  const max = Math.max(...items.map((i) => i.value));
  const barW = W - padL - padR;
  const rows = items
    .map((it, i) => {
      const y = padT + i * rowH;
      const w = Math.max(3, Math.round((it.value / max) * barW));
      const cy = y + rowH / 2;
      return `
    <text x="${padL - 14}" y="${cy}" text-anchor="end" dominant-baseline="middle" font-size="20" fill="${TXT}">${it.label}</text>
    <rect x="${padL}" y="${y + 8}" width="${w}" height="${rowH - 22}" rx="6" fill="${i === 0 ? BRAND : BRAND_LT}"/>
    <text x="${padL + w + 10}" y="${cy}" dominant-baseline="middle" font-size="19" font-weight="700" fill="${TXT}">${lei(it.value)}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}" style="width:100%;height:auto;font-family:'Inter',system-ui,sans-serif;background:#fff;border:1px solid ${GRID};border-radius:12px">
    <text x="26" y="34" font-size="23" font-weight="700" fill="${TXT}" font-family="'Plus Jakarta Sans','Inter',sans-serif">${title}</text>
    <text x="26" y="58" font-size="16" fill="${MUT}">${unit}</text>${rows}
  </svg>`;
}

/** interval salarial: spectru min..max cu marker pe mediu (vizual diferit de bare) */
function rangeChart({ title, unit, min, mediu, max }) {
  const W = 720, H = 210, padL = 70, padR = 70, padT = 74;
  const y = padT + 48;
  const x0 = padL, x1 = W - padR, span = x1 - x0;
  const sx = (v) => x0 + (v / max) * span;
  const xmin = sx(min), xmed = sx(mediu), xmax = sx(max);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}" style="width:100%;height:auto;font-family:'Inter',system-ui,sans-serif;background:#fff;border:1px solid ${GRID};border-radius:12px">
    <text x="26" y="34" font-size="23" font-weight="700" fill="${TXT}" font-family="'Plus Jakarta Sans','Inter',sans-serif">${title}</text>
    <text x="26" y="58" font-size="16" fill="${MUT}">${unit}</text>
    <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${GRID}" stroke-width="12" stroke-linecap="round"/>
    <line x1="${xmin}" y1="${y}" x2="${xmax}" y2="${y}" stroke="${BRAND_LT}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="${xmed}" cy="${y}" r="12" fill="${BRAND}" stroke="#fff" stroke-width="2"/>
    <text x="${xmin}" y="${y + 34}" text-anchor="middle" font-size="15" fill="${MUT}">minim</text>
    <text x="${xmin}" y="${y + 54}" text-anchor="middle" font-size="19" font-weight="700" fill="${TXT}">${lei(min)}</text>
    <text x="${xmax}" y="${y + 34}" text-anchor="middle" font-size="15" fill="${MUT}">maxim</text>
    <text x="${xmax}" y="${y + 54}" text-anchor="middle" font-size="19" font-weight="700" fill="${TXT}">${lei(max)}</text>
    <text x="${xmed}" y="${y - 26}" text-anchor="middle" font-size="15" fill="${BRAND}">mediu</text>
    <text x="${xmed}" y="${y - 44}" text-anchor="middle" font-size="21" font-weight="700" fill="${BRAND}">${lei(mediu)}</text>
  </svg>`;
}

/** bare VERTICALE (comparație între meserii); vizual diferit de barele orizontale */
function verticalChart({ title, unit, items }) {
  const W = 720, H = 360, padT = 84, padB = 56, padL = 30, padR = 30;
  const n = items.length, areaW = W - padL - padR, slot = areaW / n;
  const barW = Math.min(96, slot * 0.5);
  const max = Math.max(...items.map((i) => i.value));
  const baseY = H - padB, chartH = baseY - padT;
  const bars = items
    .map((it, i) => {
      const cx = padL + slot * i + slot / 2;
      const h = Math.max(3, (it.value / max) * chartH);
      const y = baseY - h;
      return `
    <rect x="${cx - barW / 2}" y="${y}" width="${barW}" height="${h}" rx="6" fill="${it.highlight ? BRAND : BRAND_LT}"/>
    <text x="${cx}" y="${y - 10}" text-anchor="middle" font-size="19" font-weight="700" fill="${TXT}">${lei(it.value)}</text>
    <text x="${cx}" y="${baseY + 26}" text-anchor="middle" font-size="17" fill="${it.highlight ? TXT : MUT}" font-weight="${it.highlight ? 600 : 400}">${it.label}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}" style="width:100%;height:auto;font-family:'Inter',system-ui,sans-serif;background:#fff;border:1px solid ${GRID};border-radius:12px">
    <text x="26" y="34" font-size="23" font-weight="700" fill="${TXT}" font-family="'Plus Jakarta Sans','Inter',sans-serif">${title}</text>
    <text x="26" y="58" font-size="16" fill="${MUT}">${unit}</text>
    <line x1="${padL}" y1="${baseY}" x2="${W - padR}" y2="${baseY}" stroke="${GRID}" stroke-width="1"/>${bars}
  </svg>`;
}

// meserii înrudite (pt chart comparativ)
const bySlug = Object.fromEntries(meserii.map((x) => [x.slug, x]));

// Chart 1: salariu pe experiență (min/mediu/max)
const nat = m.salpiuNational;
const svgExp = barChart({
  title: `Salariul unui ${m.nume.toLowerCase()} după experiență`,
  unit: 'lei net / lună',
  items: [
    { label: 'Început (0-2 ani)', value: nat.min },
    { label: 'Experiență (2-5 ani)', value: nat.mediu },
    { label: 'Senior / specializat', value: nat.max },
  ],
});

// Chart 2: top orașe după salariu mediu
const top = Object.entries(m.salpiuOrase)
  .map(([id, s]) => ({ label: oraseNume[id] || id, value: s.mediu }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 8);
const svgOrase = barChart({
  title: `Salariu mediu ${m.nume.toLowerCase()} pe orașe`,
  unit: 'lei net / lună',
  items: top,
});

// Chart 3: interval salarial (spectru)
const svgRange = rangeChart({
  title: `Intervalul de salariu pentru un ${m.nume.toLowerCase()}`,
  unit: 'lei net / lună',
  min: nat.min, mediu: nat.mediu, max: nat.max,
});

// Chart 4: comparație cu meserii înrudite (bare verticale)
const compareItems = [
  { label: m.nume, value: nat.mediu, highlight: true },
  ...m.meseriiSimilare
    .map((s) => bySlug[s])
    .filter(Boolean)
    .slice(0, 3)
    .map((x) => ({ label: x.nume, value: x.salpiuNational.mediu })),
];
const svgCompare = verticalChart({
  title: `${m.nume} față de meserii înrudite`,
  unit: 'salariu mediu net / lună',
  items: compareItems,
});

writeFileSync(`/tmp/chart-${slug}-exp.svg`, svgExp);
writeFileSync(`/tmp/chart-${slug}-orase.svg`, svgOrase);
writeFileSync(`/tmp/chart-${slug}-range.svg`, svgRange);
writeFileSync(`/tmp/chart-${slug}-compare.svg`, svgCompare);
console.log(`Scris 4 charturi pt ${slug}: exp, orase, range, compare`);
