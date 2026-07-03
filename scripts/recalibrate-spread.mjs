/**
 * Recalibrare INTERVAL salarial (min/max) — păstrează media INS neatinsă.
 *
 * PROBLEMA: calibrate-salaries.mjs a ancorat mediile pe INS (real), dar a păstrat
 * spread-ul fabricat min=0.55×mediu, max=2.0×mediu IDENTIC pe toate 400 meserii.
 * Un interval real diferă cu meseria: joburile entry au dispersie mică, cele
 * profesionale (dev, medic, pilot, avocat) au dispersie mare.
 *
 * FIX: mediile (național + fiecare oraș) RĂMÂN EXACT. Recalculăm doar min/max
 * cu un model de dispersie funcție de nivelul salariului (proxy pt senioritate).
 * Rulează: node scripts/recalibrate-spread.mjs [--apply]   (fără --apply = DRY RUN)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');
const APPLY = process.argv.includes('--apply');

// Model dispersie: raporturi min/max funcție de media meseriei (smooth, clamp 2500..12000).
// Entry (2500): min 0.80, max 1.45 (strâns). High (12000+): min 0.58, max 2.00 (larg, real).
function ratios(mediu) {
  const t = Math.max(0, Math.min(1, (mediu - 2500) / (12000 - 2500)));
  return { min: 0.80 - t * (0.80 - 0.58), max: 1.45 + t * (2.00 - 1.45) };
}
const r0 = (n) => Math.round(n);
const fmt = (n) => n.toLocaleString('ro-RO');
// Prag inferior ≈ net salariu minim 2026 (~2.574). Nu afișăm full-time sub minim.
// Sigur: capat la min(FLOOR, mediu*0.9) => min < mediu MEREU (nu sparge invarianta).
const FLOOR = 2550;
const calcMin = (mediu, minR) => Math.max(r0(mediu * minR), Math.min(FLOOR, r0(mediu * 0.9)));

const meserii = JSON.parse(readFileSync(join(dataDir, 'meserii.json'), 'utf-8'));

let sample = [], sanity = { negativ: 0, minPesteMediu: 0, maxSubMediu: 0, maxRatioVechi2: 0 };
const vechiMaxRatios = new Set();

for (const m of meserii) {
  const nat = m.salpiuNational;
  vechiMaxRatios.add((nat.max / nat.mediu).toFixed(2));
  // raportul se calculează din media NAȚIONALĂ = proprietate a MESERIEI, aplicat uniform pe orașe
  const { min: minR, max: maxR } = ratios(nat.mediu);

  const oldNat = { ...nat };
  nat.min = calcMin(nat.mediu, minR);
  nat.max = r0(nat.mediu * maxR);

  for (const oid of Object.keys(m.salpiuOrase)) {
    const c = m.salpiuOrase[oid];
    c.min = calcMin(c.mediu, minR);
    c.max = r0(c.mediu * maxR);
    // sanity per oraș
    if (c.min <= 0 || c.max <= 0) sanity.negativ++;
    if (c.min > c.mediu) sanity.minPesteMediu++;
    if (c.max < c.mediu) sanity.maxSubMediu++;
  }

  // regenerează fpiIntrebari[0] (Cât câștigă) cu noile min/max (media neschimbată)
  m.fpiIntrebari = m.fpiIntrebari.map((f) => {
    if (f.intrebare.includes('Cât câștigă')) {
      return { ...f, raspuns: `Salariul mediu net al unui ${m.nume.toLowerCase()} este de ${fmt(nat.mediu)} lei pe lună. Intervalul variază între ${fmt(nat.min)} lei și ${fmt(nat.max)} lei, în funcție de experiență, angajator și oraș.` };
    }
    return f;
  });

  if (sample.length < 14 && ['casier','ospatar','sudor','farmacist','dezvoltator-software','pilot-avion','controlor-trafic-aerian','avocat','curier','agent-paza','bucatar','medic-stomatolog','vanzator','sofer-tir'].includes(m.slug)) {
    sample.push({ nume: m.nume, mediu: nat.mediu, oldMin: oldNat.min, oldMax: oldNat.max, newMin: nat.min, newMax: nat.max });
  }
}

console.log('=== DISPERSIE: înainte (fix 0.55/2.0) vs după (realist) ===');
console.log('meserie                  | mediu  | VECHI min-max        | NOU min-max');
for (const s of sample.sort((a,b)=>a.mediu-b.mediu)) {
  console.log(`${s.nume.padEnd(24)} | ${fmt(s.mediu).padStart(6)} | ${(fmt(s.oldMin)+'-'+fmt(s.oldMax)).padEnd(20)} | ${fmt(s.newMin)}-${fmt(s.newMax)}`);
}
console.log('\n=== SANITY (trebuie toate 0) ===');
console.log(JSON.stringify(sanity));
console.log('raporturi max/mediu VECHI distincte:', [...vechiMaxRatios].join(', '), '(era fix 2.00)');
const newMaxR = new Set(meserii.map(m=>(m.salpiuNational.max/m.salpiuNational.mediu).toFixed(2)));
console.log('raporturi max/mediu NOI distincte:', [...newMaxR].sort().join(', '));
console.log('\nMedia națională (neschimbată):', fmt(r0(meserii.reduce((a,m)=>a+m.salpiuNational.mediu,0)/meserii.length)), 'lei');

if (APPLY) {
  writeFileSync(join(dataDir, 'meserii.json'), JSON.stringify(meserii, null, 2), 'utf-8');
  console.log('\n✓ APLICAT: meserii.json scris cu interval recalibrat (media neatinsă).');
} else {
  console.log('\n[DRY RUN] Nimic scris. Rulează cu --apply ca să scrii.');
}
