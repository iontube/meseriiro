// Genereaza src/data/cor.json din lista oficiala COR 2026 + maparea la meseriile noastre.
// Sursa: ORD. MMFTSS/INS 629/372/2026, MOR 598/22.07.2026.
import fs from 'node:fs';
import path from 'node:path';

const S = '/tmp/claude-0/-sites/5ee0c222-db73-4a45-b0e8-bcdab88e06a9/scratchpad/';
const MARK = /\s+(prin ORD\.|ocupati[ae] |ocupatia |publicat in MOR|conform ORD|introdus[ăa]? prin|redenumit|mutat[ăa]? |a fost |Intrucat |BAZA DE DATE|COR 2026|performanta |cautarea )/i;

const ocupatii = new Map();
for (const l of fs.readFileSync(S + 'cor2026.txt', 'utf8').split('\n')) {
  const m = l.match(/^\s*(\d{6})\s+(.+)$/); if (!m) continue;
  let den = m[2].split(/\s{3,}/)[0];
  const t = den.match(MARK); if (t) den = den.slice(0, t.index);
  den = den.trim().replace(/[*]+$/, '').trim();
  if (!den || den.length > 80 || /^\d/.test(den)) continue;
  if (!ocupatii.has(m[1])) ocupatii.set(m[1], den);
}

const GRUPE = {
  '1': { slug: 'conducatori-si-functii-de-conducere', nume: 'Conducători și funcții de conducere',
    oficial: 'Membri ai corpului legislativ, ai executivului, înalți conducători ai administrației publice, conducători și funcționari superiori',
    descriere: 'Ocupațiile de conducere: administrarea unei organizații, coordonarea de departamente, decizii de strategie și buget. Cer de regulă studii superioare și experiență de management.' },
  '2': { slug: 'specialisti-cu-studii-superioare', nume: 'Specialiști cu studii superioare',
    oficial: 'Specialiști în diverse domenii de activitate',
    descriere: 'Ocupații care presupun studii superioare finalizate și cunoștințe teoretice avansate: ingineri, medici, profesori, juriști, economiști, specialiști IT.' },
  '3': { slug: 'tehnicieni-si-maistri', nume: 'Tehnicieni și maiștri',
    oficial: 'Tehnicieni și alți specialiști din domeniul tehnic',
    descriere: 'Ocupații tehnice care cer studii medii sau postliceale de specialitate. Aplică în practică cunoștințe tehnice și supraveghează activitatea muncitorilor calificați.' },
  '4': { slug: 'functionari-administrativi', nume: 'Funcționari administrativi',
    oficial: 'Funcționari administrativi',
    descriere: 'Ocupații de birou: evidența documentelor, relația cu publicul, operarea datelor, casierie. Cer de regulă studii medii.' },
  '5': { slug: 'lucratori-in-servicii-si-comert', nume: 'Lucrători în servicii și comerț',
    oficial: 'Lucrători în domeniul serviciilor',
    descriere: 'Ocupații din comerț, alimentație publică, turism, îngrijire personală și servicii de protecție. Contactul direct cu clientul e miezul activității.' },
  '6': { slug: 'agricultura-silvicultura-si-pescuit', nume: 'Agricultură, silvicultură și pescuit',
    oficial: 'Lucrători calificați în agricultură, silvicultură și pescuit',
    descriere: 'Ocupații calificate din agricultură, creșterea animalelor, exploatarea pădurilor și pescuit.' },
  '7': { slug: 'muncitori-calificati-si-mestesugari', nume: 'Muncitori calificați și meșteșugari',
    oficial: 'Muncitori calificați și asimilați',
    descriere: 'Meserii care cer calificare printr-o școală profesională sau un curs autorizat: construcții, prelucrarea metalelor, instalații, tâmplărie, mecanică.' },
  '8': { slug: 'operatori-masini-si-instalatii', nume: 'Operatori mașini și instalații',
    oficial: 'Operatori la instalații și mașini; asamblori de mașini și echipamente',
    descriere: 'Ocupații de deservire a utilajelor fixe și mobile, a liniilor de producție și a mijloacelor de transport.' },
  '9': { slug: 'muncitori-necalificati', nume: 'Muncitori necalificați',
    oficial: 'Muncitori necalificați',
    descriere: 'Ocupații care nu cer calificare formală, bazate pe efort fizic și sarcini simple, repetitive.' },
  '0': { slug: 'fortele-armate', nume: 'Forțele armate', oficial: 'Ocupații ale forțelor armate',
    descriere: 'Ocupații militare.' },
};

// maparea meserii -> cod, din meserii.json (deja corectat)
const meserii = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/meserii.json'), 'utf8'));
const perCod = new Map();
for (const m of meserii) {
  if (!m.codCOR) continue;
  if (!perCod.has(m.codCOR)) perCod.set(m.codCOR, []);
  perCod.get(m.codCOR).push({ slug: m.slug, nume: m.nume });
}

const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const pagini = [];
for (const [cod, meseriiCod] of perCod) {
  const den = ocupatii.get(cod);
  if (!den) continue;
  const grupaBaza = cod.slice(0, 4);
  const inrudite = [...ocupatii.entries()]
    .filter(([c]) => c.slice(0, 4) === grupaBaza && c !== cod)
    .map(([c, d]) => ({ cod: c, den: d, areaPagina: perCod.has(c) }));
  pagini.push({
    cod, denumire: den, slug: `${cod}-${slugify(den)}`,
    grupaMajora: cod[0], grupaBaza, meserii: meseriiCod, inrudite,
  });
}
pagini.sort((a, b) => a.cod.localeCompare(b.cod));

const grupe = Object.entries(GRUPE)
  .filter(([k]) => pagini.some(p => p.grupaMajora === k))
  .map(([k, v]) => ({ cifra: k, ...v, nrOcupatiiOficiale: [...ocupatii.keys()].filter(c => c[0] === k).length }));

const out = { actualizat: '2026-07-22', ordin: 'ORD. MMFTSS/INS 629/372/2026',
  monitor: 'Monitorul Oficial 598 / 22.07.2026', totalOcupatiiOficiale: ocupatii.size, grupe, pagini };
fs.writeFileSync(path.join(process.cwd(), 'src/data/cor.json'), JSON.stringify(out, null, 1));

// index de cautare: TOATE ocupatiile oficiale (pentru cautarea client-side)
const index = [...ocupatii.entries()].map(([c, d]) => {
  const p = pagini.find(x => x.cod === c);
  return p ? [c, d, p.slug] : [c, d];
});
fs.writeFileSync(path.join(process.cwd(), 'public/cor-index.json'), JSON.stringify(index));
console.log(`cor.json: ${pagini.length} pagini de cod, ${grupe.length} grupe`);
console.log(`cor-index.json: ${index.length} ocupatii (${(fs.statSync(path.join(process.cwd(),'public/cor-index.json')).size/1024).toFixed(0)} KB)`);
