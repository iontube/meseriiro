/**
 * Aplică conținut de text UNIC per meserie dintr-un fișier de override.
 * Patchează DOAR câmpurile de text prezente în override (descriere, ceFaceConcret,
 * responsabilitati, studiiNecesare, conditiiMunca, evolutieCariera).
 * NU atinge: salarii (INS), competente, fpiIntrebari, meta. Scalează la 400.
 * Rulează: node scripts/apply-content.mjs scripts/content-poc.json [--apply]
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');
const overrideFile = process.argv[2];
const APPLY = process.argv.includes('--apply');
const ALLOWED = ['descriere', 'ceFaceConcret', 'responsabilitati', 'studiiNecesare', 'conditiiMunca', 'evolutieCariera'];

const meserii = JSON.parse(readFileSync(join(dataDir, 'meserii.json'), 'utf-8'));
const override = JSON.parse(readFileSync(join(__dirname, '..', overrideFile.replace(/^scripts\//,'scripts/')), 'utf-8'));
const bySlug = Object.fromEntries(meserii.map(m => [m.slug, m]));

let patched = 0, skipped = [];
for (const [slug, fields] of Object.entries(override)) {
  const m = bySlug[slug];
  if (!m) { skipped.push(slug); continue; }
  for (const [k, v] of Object.entries(fields)) {
    if (!ALLOWED.includes(k)) { console.log(`  ! câmp nepermis ignorat: ${slug}.${k}`); continue; }
    m[k] = v;
  }
  patched++;
}
console.log(`Patchate: ${patched} meserii. Lipsă (slug inexistent): ${skipped.join(', ') || 'niciunul'}`);

// validare: câmpurile patchate nu sunt goale + lungimi rezonabile
let bad = 0;
for (const slug of Object.keys(override)) {
  const m = bySlug[slug]; if (!m) continue;
  for (const k of ALLOWED) {
    if (override[slug][k] === undefined) continue;
    const v = m[k];
    const ok = Array.isArray(v) ? v.length >= 3 && v.every(x => x.length > 8) : typeof v === 'string' && v.length > 40;
    if (!ok) { console.log(`  BAD ${slug}.${k}`); bad++; }
  }
}
console.log(`Validare: ${bad} câmpuri invalide.`);

if (APPLY && bad === 0) {
  writeFileSync(join(dataDir, 'meserii.json'), JSON.stringify(meserii, null, 2), 'utf-8');
  console.log('✓ APLICAT: meserii.json actualizat cu conținut unic.');
} else if (!APPLY) {
  console.log('[DRY RUN] Rulează cu --apply ca să scrii.');
}
