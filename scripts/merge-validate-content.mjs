/**
 * Merge + VALIDARE conținut generat (gen-out-1..12) + POC (content-poc.json) → /tmp/content-all.json
 * Validează temeinic ÎNAINTE de aplicare. Rulează: node scripts/merge-validate-content.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const meserii = JSON.parse(readFileSync(join(__dirname,'..','src','data','meserii.json'),'utf-8'));
const validSlugs = new Set(meserii.map(m=>m.slug));

// merge
const all = {};
const poc = JSON.parse(readFileSync(join(__dirname,'content-poc.json'),'utf-8'));
Object.assign(all, poc);
let files=0;
for (let i=1;i<=12;i++){ const f=`/tmp/gen-out-${i}.json`; if(existsSync(f)){ Object.assign(all, JSON.parse(readFileSync(f,'utf-8'))); files++; } else console.log(`⚠ LIPSĂ /tmp/gen-out-${i}.json`); }

const FIELDS=['descriere','ceFaceConcret','responsabilitati','studiiNecesare','conditiiMunca','evolutieCariera'];
const BANNED=['activități de specialitate','provocări concrete','execută operațiuni specifice','conform standardelor profesionale','cunoștințe de specialitate'];
const problems=[];
const descrieri=new Map();

for (const [slug,c] of Object.entries(all)){
  if(!validSlugs.has(slug)) problems.push(`slug inexistent: ${slug}`);
  for(const f of FIELDS){
    if(c[f]===undefined){ problems.push(`${slug}: lipsește ${f}`); continue; }
    if(f==='responsabilitati'){
      if(!Array.isArray(c[f])||c[f].length<5||c[f].length>7) problems.push(`${slug}.responsabilitati: ${Array.isArray(c[f])?c[f].length:'nu e array'} (trebuie 5-7)`);
      else c[f].forEach((r,j)=>{ if(typeof r!=='string'||r.length<10) problems.push(`${slug}.responsabilitati[${j}] prea scurt`); });
    } else {
      if(typeof c[f]!=='string'||c[f].length<40) problems.push(`${slug}.${f}: prea scurt/gol`);
      if(c[f].length>500) problems.push(`${slug}.${f}: prea lung (${c[f].length})`);
    }
    const txt = Array.isArray(c[f])?c[f].join(' '):c[f];
    if(/[—–]/.test(txt)) problems.push(`${slug}.${f}: em/en-dash`);
    for(const b of BANNED) if(txt.toLowerCase().includes(b)) problems.push(`${slug}.${f}: clișeu interzis "${b}"`);
    if(/\d[\d.]{2,}\s*lei/i.test(txt)) problems.push(`${slug}.${f}: conține cifră de salariu`);
  }
  if(c.descriere){ const key=c.descriere.slice(0,60); if(descrieri.has(key)) problems.push(`descriere DUPLICAT: ${slug} == ${descrieri.get(key)}`); else descrieri.set(key,slug); }
}

const covered=Object.keys(all).filter(s=>validSlugs.has(s)).length;
console.log(`=== MERGE ===`);
console.log(`fișiere gen-out citite: ${files}/12`);
console.log(`meserii acoperite: ${covered}/${meserii.length}`);
const missing=meserii.filter(m=>!all[m.slug]).map(m=>m.slug);
if(missing.length) console.log(`LIPSESC (${missing.length}): ${missing.slice(0,20).join(', ')}${missing.length>20?'...':''}`);
console.log(`\n=== VALIDARE ===`);
console.log(`probleme: ${problems.length}`);
problems.slice(0,40).forEach(p=>console.log('  '+p));
if(problems.length>40) console.log(`  ... +${problems.length-40} mai multe`);

writeFileSync('/tmp/content-all.json', JSON.stringify(all,null,1));
console.log(`\n✓ scris /tmp/content-all.json (${covered} meserii). ${problems.length===0&&missing.length===0?'GATA de aplicat.':'REPARĂ problemele întâi.'}`);
