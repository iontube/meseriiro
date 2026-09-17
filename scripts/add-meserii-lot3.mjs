/**
 * Lot 3 — adaugă în catalog 3 meserii lipsă: șofer ridesharing, însoțitor de bord,
 * îngrijitor de bătrâni.
 *
 * Salariile NU sunt tastate la nivel de oraș. Se declară o singură valoare națională,
 * ancorată pe surse reale (vezi SURSE la fiecare meserie), iar valorile pe oraș se
 * derivă cu aceeași metodă ca `calibrate-salaries.mjs`: media județului / media
 * națională INS (iunie 2025).
 *
 * `amortizare` = cât din diferența față de media națională se aplică efectiv.
 * 1.0 pentru meserii plătite de piața locală (cursa se plătește unde se face).
 * 0.25 pentru însoțitor de bord, unde grila e stabilită de companie la nivel de rețea,
 * nu de piața orașului — baza diferă între orașe doar prin mixul de operatori.
 *
 * Rulează o singură dată: dacă meseriile există deja, iese fără să scrie.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

// Date INS iunie 2025, identice cu calibrate-salaries.mjs
const MEDIA_NATIONALA = 5539;
const salariuJudete = {
  'bucuresti': 7051, 'cluj': 6633, 'timis': 6192, 'sibiu': 5528, 'brasov': 5376,
  'iasi': 5335, 'arad': 5025, 'prahova': 4987, 'mures': 4982, 'constanta': 4880,
  'galati': 4858, 'dolj': 4837, 'bihor': 4670, 'suceava': 4208,
};
const orasJudet = {
  'bucuresti': 'bucuresti', 'cluj-napoca': 'cluj', 'timisoara': 'timis', 'iasi': 'iasi',
  'brasov': 'brasov', 'constanta': 'constanta', 'craiova': 'dolj', 'galati': 'galati',
  'oradea': 'bihor', 'sibiu': 'sibiu', 'ploiesti': 'prahova', 'arad': 'arad',
  'targu-mures': 'mures', 'suceava': 'suceava',
};

// Cele 12 orașe agreate = 68% din valoarea paginilor-oraș (top 15 = 74%).
const ORASE_TRAFIC = [
  'bucuresti', 'cluj-napoca', 'iasi', 'timisoara', 'brasov', 'constanta',
  'craiova', 'arad', 'oradea', 'targu-mures', 'ploiesti', 'galati',
];

// Pentru însoțitor de bord contează unde există aeroport cu curse comerciale,
// nu clasamentul de trafic: Ploiești și Galați nu au, Sibiu și Suceava au.
const ORASE_AEROPORT = [
  'bucuresti', 'cluj-napoca', 'iasi', 'timisoara', 'brasov', 'constanta',
  'craiova', 'arad', 'oradea', 'targu-mures', 'sibiu', 'suceava',
];

function salariiPeOrase(national, orase, amortizare = 1.0) {
  const minRatio = national.min / national.mediu;
  const maxRatio = national.max / national.mediu;
  const out = {};
  for (const orasId of orase) {
    const judet = orasJudet[orasId];
    const coefBrut = salariuJudete[judet] / MEDIA_NATIONALA;
    const coef = 1 + (coefBrut - 1) * amortizare;
    const mediu = Math.round(national.mediu * coef);
    out[orasId] = {
      min: Math.round(mediu * minRatio),
      mediu,
      max: Math.round(mediu * maxRatio),
    };
  }
  return out;
}

const lei = (n) => n.toLocaleString('ro-RO');

// ═══════════════════════════════════════════════════════════════
// 1. ȘOFER RIDESHARING
// SURSE: presa și flotele partenere 2026 — București full-time (8-10 h/zi, 5-6 zile)
// = 4.000-6.500 lei net după comision și cheltuieli, formulările uzuale dau 5.000-6.000.
// Comision platformă: Bolt 25% fix; Uber redus la 20% în România din februarie 2026.
// Cost de exploatare estimat 0,30-0,50 lei/km, ~1.200-2.000 lei/lună la 4.000 km.
// Valoarea națională e aleasă astfel încât Bucureștiul să cadă în banda 5.000-6.000.
// COR 832201 (șofer de autoturisme și camionete) — aceeași ocupație pentru Bolt și Uber.
// ═══════════════════════════════════════════════════════════════
const soferRidesharing = {
  id: 'sofer-ridesharing',
  slug: 'sofer-ridesharing',
  nume: 'Șofer Ridesharing',
  codCOR: '832201',
  dompiuId: 'transport-logistica',
  descriere: 'Șoferul de ridesharing transportă pasageri cu mașina proprie sau a unei flote partenere, prin aplicații ca Bolt și Uber. Nu are salariu fix: încasează per cursă, din care platforma reține comisionul, iar ce rămâne după combustibil și întreținere este venitul real. Este ocupația de intrare cea mai rapidă din transportul de persoane, cu program pe care și-l face singur.',
  ceFaceConcret: 'Pornește aplicația, acceptă cursele repartizate și duce pasagerii la destinație pe ruta cea mai bună la ora respectivă. Își alege intervalele cu cerere mare, urmărește tarifarea dinamică, întreține mașina și ține evidența încasărilor, a combustibilului și a comisionului reținut de platformă.',
  responsabilitati: [
    'Preluarea pasagerilor și transportul lor în siguranță la destinație',
    'Alegerea rutei în funcție de trafic și de estimarea din aplicație',
    'Menținerea mașinii curate, verificată tehnic și conformă cerințelor platformei',
    'Gestionarea plăților în aplicație, cu card sau numerar, și a bonurilor',
    'Respectarea legislației de transport alternativ și a atestatului obligatoriu',
    'Urmărirea propriei rentabilități: curse pe oră, cost pe kilometru, comision',
  ],
  competente: ['conducere-vehicule', 'relatii-clienti', 'planificare-organizare'],
  studiiNecesare: 'Nu se cer studii superioare. Ai nevoie de permis categoria B cu vechime de cel puțin doi ani, atestat de transport alternativ obținut după un curs scurt, cazier judiciar și aviz medical. Mașina trebuie să respecte condițiile de vechime și dotare cerute de platformă, fie că este a ta, fie închiriată de la o flotă parteneră.',
  conditiiMunca: 'Program ales de tine, dar venitul urmează cererea: serile, weekendurile și orele de vârf plătesc mult mai bine decât dimineața de marți. Multe ore la volan, în trafic aglomerat, cu pauze scurte și contact permanent cu clienți. În orașele mari din afara Bucureștiului veniturile sunt cu 20-30% mai mici, pentru că se fac mai puține curse pe oră la același tarif.',
  evolutieCariera: 'Începi de obicei pe o mașină de flotă, cu chirie săptămânală, apoi treci pe mașină proprie și păstrezi tot ce rămâne după comision. De acolo poți urca la categoriile superioare ale platformelor, care plătesc mai bine per cursă, poți deschide propria flotă cu mai multe mașini și șoferi, ori te poți muta spre transport de persoane la comandă sau curierat.',
  nivelCerere: 'ridicat',
  salpiuNational: { min: 3150, mediu: 4320, max: 5200 },
  meseriiSimilare: ['sofer-autobuz', 'curier', 'sofer-tir'],
  fpiIntrebari: [
    {
      intrebare: 'Cât câștigă un șofer Bolt sau Uber în România?',
      raspuns: 'În București, un șofer full-time care lucrează 8-10 ore pe zi, 5-6 zile pe săptămână, rămâne cu aproximativ 5.500 lei net pe lună, într-un interval realist de 4.000-6.500 lei, după comisionul platformei și după combustibil, întreținere și amortizarea mașinii. Suma facturată brut este mult mai mare, de ordinul a 10.000-15.000 lei, dar din ea se scad toate costurile. În orașele mai mici veniturile sunt cu 20-30% mai reduse.',
    },
    {
      intrebare: 'Ce comision rețin Bolt și Uber din fiecare cursă?',
      raspuns: 'Bolt reține un comision fix de 25% din prețul cursei. Uber a redus comisionul standard în România la 20% începând din februarie 2026. Dacă lucrezi pe mașina unei flote partenere, se adaugă și chiria săptămânală sau procentul flotei, care se scade tot din încasările tale.',
    },
    {
      intrebare: 'Ce îți trebuie ca să devii șofer de ridesharing?',
      raspuns: 'Permis categoria B cu minimum doi ani vechime, atestat de transport alternativ obținut după un curs scurt, cazier judiciar, aviz medical și o mașină care respectă condițiile de vechime ale platformei. Dacă nu ai mașină proprie, te poți înscrie printr-o flotă parteneră, care îți pune la dispoziție autoturismul contra unei chirii.',
    },
  ],
  metaTitle: 'Șofer Ridesharing (Bolt, Uber) - Salariu și Condiții | Meserii.ro',
  metaDescription: 'Cât câștigă un șofer Bolt sau Uber în 2026, ce comision rețin platformele și ce acte îți trebuie. Venit net mediu: 4.320 lei/lună.',
};

// ═══════════════════════════════════════════════════════════════
// 2. ÎNSOȚITOR DE BORD
// SURSE: Gândul, 14.06.2026 — venit total lunar pe operator, în România:
//   Wizz Air: bază 3.000-4.500 net + diurnă ~200 lei/zi (12-14 zile) + comision
//             vânzări la bord 500-1.000  ->  total 6.000-9.500
//   Ryanair:  bază ~4.500  ->  total 7.500-8.500
//   TAROM:    bază 3.500-4.500 + sporuri 2.000-3.000  ->  total 6.000-8.500
//             (peste 10.000 la șefele de cabină)
//   HiSky:    bază 3.500-4.000  ->  total 6.500-8.000 (9.500-11.000 pe transatlantice)
// Valoarea națională = mediana benzilor de mai sus; maximul acoperă șef de cabină
// și curse transatlantice. COR 511101 (grupa 5111 - însoțitori de zbor și stewarzi).
// ═══════════════════════════════════════════════════════════════
const insotitorDeBord = {
  id: 'insotitor-de-bord',
  slug: 'insotitor-de-bord',
  nume: 'Însoțitor de Bord',
  codCOR: '511101',
  dompiuId: 'transport-logistica',
  descriere: 'Însoțitorul de bord, cunoscut și ca steward sau stewardesă, răspunde de siguranța și de confortul pasagerilor pe durata zborului. Rolul pare orientat spre servire, dar formarea și evaluările anuale sunt despre proceduri de urgență: evacuare, decompresie, fum la bord, primul ajutor. Venitul se compune din salariul de bază plus diurne de zbor, motiv pentru care diferă mult de la un operator la altul.',
  ceFaceConcret: 'Participă la briefingul echipajului, verifică echipamentele de siguranță din cabină și numărul de pasageri, prezintă instrucțiunile de siguranță și supraveghează decolarea și aterizarea. În zbor servește mâncare și băuturi, vinde produse la bord, asistă pasagerii cu nevoi speciale și intervine la incidente medicale sau la comportament neconform.',
  responsabilitati: [
    'Verificarea echipamentelor de siguranță și de urgență înainte de fiecare zbor',
    'Prezentarea instrucțiunilor de siguranță și supravegherea cabinei la decolare și aterizare',
    'Acordarea primului ajutor și gestionarea urgențelor medicale la bord',
    'Servirea pasagerilor și vânzarea produselor din oferta de la bord',
    'Aplicarea procedurilor de evacuare și de gestionare a incidentelor',
    'Raportarea defecțiunilor și a evenimentelor din cabină către comandant',
  ],
  competente: ['relatii-clienti', 'limbi-straine', 'prim-ajutor', 'lucru-echipa'],
  studiiNecesare: 'Este suficient bacalaureatul. Obligatoriu este Atestatul de Membru al Echipajului de Cabină, obținut după un curs autorizat de câteva săptămâni și reînnoit periodic, plus engleză conversațională, aviz medical aeronautic și cazier. Companiile impun și cerințe de înălțime pentru accesul la compartimentele de siguranță și, în general, vârsta minimă de 18 ani.',
  conditiiMunca: 'Program în ture neregulate, cu treziri la ore mici, nopți petrecute în afara bazei și zile libere căzute în mijlocul săptămânii. Multe ore în picioare, în spațiu îngust, cu diferențe de fus orar și de presiune. Numărul de zile de zbor pe lună decide o parte importantă din venit, pentru că diurna se plătește per zi de activitate, nu lunar.',
  evolutieCariera: 'Începi ca însoțitor de bord junior pe curse scurte, iar după câțiva ani poți deveni șef de cabină, cu responsabilitatea echipajului și venit semnificativ mai mare. De acolo se poate trece la instructor de echipaj, la funcții de siguranță a zborului la sol sau la operatori care zboară transatlantic, unde diurnele sunt mai consistente.',
  nivelCerere: 'mediu',
  salpiuNational: { min: 5800, mediu: 7400, max: 10500 },
  meseriiSimilare: ['pilot-avion', 'controlor-trafic-aerian', 'ghid-turistic'],
  fpiIntrebari: [
    {
      intrebare: 'Cât câștigă o stewardesă în România?',
      raspuns: 'Venitul total lunar este în general între 6.000 și 9.500 lei net și depinde de operator. La Wizz Air, baza este de 3.000-4.500 lei, la care se adaugă diurne de circa 200 de lei pentru fiecare zi de zbor, în medie 12-14 zile pe lună, plus comisionul din vânzările la bord, de 500-1.000 de lei. La Ryanair baza este de aproximativ 4.500 de lei, iar totalul ajunge la 7.500-8.500. La TAROM, baza de 3.500-4.500 lei plus sporuri de 2.000-3.000 duce totalul la 6.000-8.500, iar șefele de cabină trec de 10.000. La HiSky, totalul este de 6.500-8.000 lei, cu 9.500-11.000 pe cursele transatlantice.',
    },
    {
      intrebare: 'Ce studii și ce atestat trebuie pentru a deveni însoțitor de bord?',
      raspuns: 'Bacalaureatul este suficient ca nivel de studii. Obligatoriu este Atestatul de Membru al Echipajului de Cabină, obținut după un curs autorizat de câteva săptămâni, alături de engleză conversațională, aviz medical aeronautic și cazier judiciar. Companiile mai cer o înălțime minimă, pentru accesul la echipamentele de siguranță din compartimentele superioare.',
    },
    {
      intrebare: 'De ce diferă atât de mult veniturile între companii aeriene?',
      raspuns: 'Pentru că salariul de bază este doar o parte din venit. Restul vine din diurnele plătite per zi de zbor și, la operatorii low-cost, din comisionul pentru vânzările la bord. Un operator cu multe zile de zbor pe lună și curse lungi ajunge la un total mai mare decât unul cu bază nominal mai bună, dar cu program mai relaxat.',
    },
  ],
  metaTitle: 'Însoțitor de Bord (Stewardesă) - Salariu și Cerințe | Meserii.ro',
  metaDescription: 'Cât câștigă o stewardesă la Wizz Air, Ryanair, TAROM sau HiSky, ce atestat îți trebuie și cum se compune venitul. Venit mediu: 7.400 lei/lună.',
};

// ═══════════════════════════════════════════════════════════════
// 3. ÎNGRIJITOR DE BĂTRÂNI
// Cifrele publicate de portalurile de salarii sunt self-reported și se bat cap în cap
// (1.006 EUR/lună vs 4.718-6.738 lei brut), deci NU se folosesc ca ancoră.
// Ancora e aceeași ca pentru restul catalogului: secțiunea CAEN Q (sănătate și
// asistență socială, 5.500 lei net INS 2025), poziționat sub media secțiunii, la
// nivelul infirmierului (3.114 lei) — aceeași muncă, la domiciliu în loc de spital.
// Verificare cu tarifele reale de piață: program extern de 8 ore = 2.500-3.500 lei/lună,
// internă permanentă în orașele mari = 3.500-5.000 lei, part-time 3-4 ore = 1.500-2.500.
// COR 532201 (îngrijitor bătrâni la domiciliu).
// ═══════════════════════════════════════════════════════════════
const ingrijitorBatrani = {
  id: 'ingrijitor-batrani',
  slug: 'ingrijitor-batrani',
  nume: 'Îngrijitor de Bătrâni',
  codCOR: '532201',
  dompiuId: 'sanatate',
  descriere: 'Îngrijitorul de bătrâni ajută o persoană vârstnică să rămână acasă, în siguranță, atunci când nu se mai descurcă singură. Se ocupă de igienă, masă, medicație și mișcare, dar și de partea pe care nimeni nu o trece în fișa postului: prezența constantă a cuiva în casă. Cererea crește odată cu îmbătrânirea populației și cu plecarea familiilor în străinătate.',
  ceFaceConcret: 'Ajută la igiena zilnică, la îmbrăcat și la deplasarea prin casă, pregătește mesele ținând cont de restricțiile medicale și administrează medicația după schema stabilită de medic. Însoțește persoana la control, face cumpărăturile și curățenia necesară, urmărește semnele de agravare și anunță familia sau medicul.',
  responsabilitati: [
    'Sprijin la igiena personală, îmbrăcat și deplasarea prin locuință',
    'Pregătirea meselor conform recomandărilor medicale',
    'Administrarea medicației la ore fixe și urmărirea efectelor',
    'Însoțirea la controale medicale și la analize',
    'Observarea schimbărilor de stare și anunțarea familiei sau a medicului',
    'Menținerea curățeniei în spațiul de locuit și a companiei zilnice',
  ],
  competente: ['ingrijirea-pacientilor', 'prim-ajutor', 'comunicare', 'atentie-detalii'],
  studiiNecesare: 'Nu se cer studii superioare. Angajatorii serioși cer certificatul de calificare de îngrijitor bătrâni la domiciliu, obținut după un curs autorizat de câteva luni, plus aviz medical și cazier. Pentru cazurile cu imobilizare la pat sau demență contează experiența dovedită și un curs de prim ajutor, mai mult decât diploma.',
  conditiiMunca: 'Muncă fizică și emoțional solicitantă, cu ridicat și mobilizat pacientul de mai multe ori pe zi. Se lucrează fie extern, în program de opt ore, fie intern, cu locuit în casa persoanei îngrijite, variantă mai bine plătită dar cu granițe greu de păstrat între program și viață personală. Relația se întinde adesea pe ani, iar pierderea persoanei îngrijite este parte din meserie.',
  evolutieCariera: 'Pornești de la cazuri ușoare, cu sprijin la treburile casei, și ajungi la cazuri medicale complexe, care se plătesc considerabil mai bine. Cu certificare suplimentară poți trece infirmier într-un centru rezidențial sau spital, coordonator de echipă la o firmă de îngrijire la domiciliu, ori poți lucra pe cont propriu, cu clienți proprii și tarif orar.',
  nivelCerere: 'ridicat',
  salpiuNational: { min: 2450, mediu: 3150, max: 4700 },
  meseriiSimilare: ['infirmier', 'brancardier', 'asistent-medical'],
  fpiIntrebari: [
    {
      intrebare: 'Cât câștigă un îngrijitor de bătrâni la domiciliu în România?',
      raspuns: 'Pentru un program extern de opt ore, veniturile se situează în general între 2.500 și 3.500 de lei net pe lună. Îngrijirea internă, cu locuit la domiciliul persoanei, ajunge la 3.500-5.000 de lei în orașele mari, iar un program part-time de trei-patru ore rămâne la 1.500-2.500 de lei. Cazurile cu imobilizare la pat sau demență se plătesc peste aceste valori.',
    },
    {
      intrebare: 'Ce calificare îți trebuie ca îngrijitor de bătrâni?',
      raspuns: 'Certificatul de calificare pentru îngrijitor bătrâni la domiciliu, obținut după un curs autorizat de câteva luni, împreună cu aviz medical și cazier judiciar. Nu sunt necesare studii superioare. Pentru cazurile medicale complexe, un curs de prim ajutor și experiența dovedită cântăresc mai mult decât diploma.',
    },
    {
      intrebare: 'Ce diferență este între îngrijitor la domiciliu și infirmier?',
      raspuns: 'Îngrijitorul lucrează în casa persoanei vârstnice și acoperă activitățile zilnice: igienă, masă, medicație după schemă, companie. Infirmierul lucrează într-o unitate medicală, sub coordonarea asistentului, și are atribuții legate de îngrijirea pacienților internați. Veniturile sunt apropiate, iar trecerea de la o poziție la alta se face cu o certificare suplimentară.',
    },
  ],
  metaTitle: 'Îngrijitor de Bătrâni - Salariu, Calificare și Condiții | Meserii.ro',
  metaDescription: 'Cât câștigă un îngrijitor de bătrâni la domiciliu, extern sau intern, ce calificare îți trebuie și cum arată munca. Salariu mediu: 3.150 lei/lună.',
};

// ═══════════════════════════════════════════════════════════════

const noi = [
  { m: soferRidesharing, orase: ORASE_TRAFIC, amortizare: 1.0 },
  { m: insotitorDeBord, orase: ORASE_AEROPORT, amortizare: 0.25 },
  { m: ingrijitorBatrani, orase: ORASE_TRAFIC, amortizare: 1.0 },
];

const meserii = JSON.parse(readFileSync(join(dataDir, 'meserii.json'), 'utf-8'));
const orase = JSON.parse(readFileSync(join(dataDir, 'orase.json'), 'utf-8'));
const competente = JSON.parse(readFileSync(join(dataDir, 'competente.json'), 'utf-8'));
const domenii = JSON.parse(readFileSync(join(dataDir, 'domenii.json'), 'utf-8'));

const orasIds = new Set(orase.map((o) => o.id));
const competentaIds = new Set(competente.map((c) => c.id));
const domeniuIds = new Set(domenii.map((d) => d.id));
const meserieIds = new Set(meserii.map((m) => m.id));

let erori = 0;
const fail = (msg) => { console.error(`  ✗ ${msg}`); erori++; };

for (const { m, orase: listaOrase, amortizare } of noi) {
  if (meserieIds.has(m.id)) fail(`${m.id} există deja în catalog`);
  if (!domeniuIds.has(m.dompiuId)) fail(`${m.id}: domeniu inexistent ${m.dompiuId}`);
  for (const c of m.competente) if (!competentaIds.has(c)) fail(`${m.id}: competență inexistentă ${c}`);
  for (const s of m.meseriiSimilare) if (!meserieIds.has(s)) fail(`${m.id}: meserie similară inexistentă ${s}`);
  for (const o of listaOrase) if (!orasIds.has(o)) fail(`${m.id}: oraș inexistent ${o}`);
  if (listaOrase.length !== 12) fail(`${m.id}: ${listaOrase.length} orașe, așteptam 12`);
  if (m.responsabilitati.length !== 6) fail(`${m.id}: ${m.responsabilitati.length} responsabilități, așteptam 6`);
  if (m.fpiIntrebari.length !== 3) fail(`${m.id}: ${m.fpiIntrebari.length} întrebări FAQ, așteptam 3`);
  m.salpiuOrase = salariiPeOrase(m.salpiuNational, listaOrase, amortizare);
}

if (erori) {
  console.error(`\n${erori} erori de validare. Nu s-a scris nimic.`);
  process.exit(1);
}

for (const { m } of noi) {
  meserii.push(m);
  console.log(`\n${m.nume} (COR ${m.codCOR}) — național ${lei(m.salpiuNational.mediu)} lei net`);
  for (const [orasId, s] of Object.entries(m.salpiuOrase)) {
    console.log(`  ${orasId.padEnd(14)} ${lei(s.min).padStart(6)} – ${String(lei(s.mediu)).padStart(6)} – ${lei(s.max).padStart(6)}`);
  }
}

writeFileSync(join(dataDir, 'meserii.json'), JSON.stringify(meserii, null, 2), 'utf-8');
console.log(`\n✓ meserii.json: ${meserii.length} meserii (+${noi.length}), ${noi.length * 12} pagini-oraș noi.`);
