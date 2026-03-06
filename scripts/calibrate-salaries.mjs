/**
 * Calibrare salarii cu date reale INS (Institutul Național de Statistică)
 *
 * Surse:
 * - Salariu mediu net pe județe: INS, iunie 2025 (via infopolitica.ro)
 * - Salariu mediu net pe secțiuni CAEN: INS, 2025 (via economica.net, news.ro)
 * - Media națională: 5.539 lei net (iunie 2025)
 *
 * Metodologie:
 * 1. Fiecare domeniu e mapat la una sau mai multe secțiuni CAEN
 * 2. Se calculează coeficientul real al domeniului față de media națională
 * 3. Fiecare oraș e mapat la un județ, cu coeficientul real INS
 * 4. Salariul per meserie se calibrează: bazaReală × coefJudețReal × proporțieMeserieÎnDomeniu
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

// ═══════════════════════════════════════════════════════════════
// DATE REALE INS - Salariu mediu net pe județe, iunie 2025
// Sursa: INS via infopolitica.ro/2025/10/12/salariul-mediu-pentru-fiecare-judet
// ═══════════════════════════════════════════════════════════════

const MEDIA_NATIONALA = 5539; // lei net, iunie 2025

const salariuJudete = {
  'bucuresti':       7051,
  'cluj':            6633,
  'timis':           6192,
  'tulcea':          5539,
  'sibiu':           5528,
  'ilfov':           5443,
  'arges':           5410,
  'brasov':          5376,
  'iasi':            5335,
  'bacau':           5138,
  'arad':            5025,
  'olt':             5003,
  'prahova':         4987,
  'mures':           4982,
  'constanta':       4880,
  'galati':          4858,
  'dolj':            4837,
  'alba':            4715,
  'caras-severin':   4697,
  'gorj':            4693,
  'bihor':           4670,
  'vaslui':          4636,
  'salaj':           4609,
  'dambovita':       4607,
  'ialomita':        4568,
  'buzau':           4567,
  'giurgiu':         4524,
  'braila':          4469,
  'calarasi':        4462,
  'hunedoara':       4405,
  'mehedinti':       4396,
  'satu-mare':       4354,
  'neamt':           4353,
  'bistrita-nasaud': 4343,
  'covasna':         4296,
  'maramures':       4287,
  'harghita':        4255,
  'teleorman':       4252,
  'suceava':         4208,
  'vrancea':         4203,
  'botosani':        4131,
  'valcea':          4126,
};

// ═══════════════════════════════════════════════════════════════
// Mapare oraș → județ
// ═══════════════════════════════════════════════════════════════

const orasJudet = {
  'bucuresti':       'bucuresti',
  'cluj-napoca':     'cluj',
  'timisoara':       'timis',
  'iasi':            'iasi',
  'brasov':          'brasov',
  'constanta':       'constanta',
  'craiova':         'dolj',
  'galati':          'galati',
  'oradea':          'bihor',
  'sibiu':           'sibiu',
  'ploiesti':        'prahova',
  'arad':            'arad',
  'pitesti':         'arges',
  'baia-mare':       'maramures',
  'buzau':           'buzau',
  'satu-mare':       'satu-mare',
  'botosani':        'botosani',
  'suceava':         'suceava',
  'ramnicu-valcea':  'valcea',
  'drobeta-turnu-severin': 'mehedinti',
  'targu-mures':     'mures',
  'bistrita':        'bistrita-nasaud',
  'focsani':         'vrancea',
  'resita':          'caras-severin',
  'tulcea':          'tulcea',
  'slatina':         'olt',
  'calarasi':        'calarasi',
  'giurgiu':         'giurgiu',
  'zalau':           'salaj',
  'deva':            'hunedoara',
  'alba-iulia':      'alba',
  'sfantu-gheorghe': 'covasna',
  'vaslui':          'vaslui',
  'targoviste':      'dambovita',
  'miercurea-ciuc':  'harghita',
  'piatra-neamt':    'neamt',
  'slobozia':        'ialomita',
  'alexandria':      'teleorman',
  'hunedoara':       'hunedoara',
  'medias':          'sibiu',
  'petrosani':       'hunedoara',
};

// ═══════════════════════════════════════════════════════════════
// DATE REALE INS - Salariu mediu net pe secțiuni CAEN Rev.2, 2025
// Surse: INS comunicat presa, economica.net, news.ro, cursdeguvernare.ro
// Valori: medii anuale estimate din datele lunare publicate
// ═══════════════════════════════════════════════════════════════

const salariuCAEN = {
  'A':  3400,  // Agricultură, silvicultură, pescuit
  'B':  6800,  // Industria extractivă
  'C':  4500,  // Industria prelucrătoare
  'D':  6200,  // Energie electrică, gaze, apă caldă
  'E':  3800,  // Distribuția apei, salubritate
  'F':  4100,  // Construcții
  'G':  3900,  // Comerț cu ridicata și amănuntul
  'H':  4300,  // Transport și depozitare
  'I':  3400,  // Hoteluri și restaurante
  'J': 11600,  // Informații și comunicații (IT)
  'K':  7500,  // Intermedieri financiare, asigurări
  'L':  4200,  // Tranzacții imobiliare
  'M':  5800,  // Activități profesionale, științifice, tehnice
  'N':  3500,  // Activități de servicii administrative
  'O':  6800,  // Administrație publică și apărare
  'P':  5400,  // Învățământ
  'Q':  5500,  // Sănătate și asistență socială
  'R':  4400,  // Activități de spectacole, cultură, recreere
  'S':  3600,  // Alte activități de servicii
};

// ═══════════════════════════════════════════════════════════════
// Mapare domeniu → secțiuni CAEN (cu ponderi)
// ═══════════════════════════════════════════════════════════════

const domeniuCAEN = {
  'it-comunicatii':        [{ caen: 'J', weight: 1.0 }],
  'constructii':           [{ caen: 'F', weight: 1.0 }],
  'sanatate':              [{ caen: 'Q', weight: 1.0 }],
  'educatie':              [{ caen: 'P', weight: 1.0 }],
  'industrie':             [{ caen: 'C', weight: 0.7 }, { caen: 'B', weight: 0.3 }],
  'transport':             [{ caen: 'H', weight: 1.0 }],
  'agricultura':           [{ caen: 'A', weight: 1.0 }],
  'horeca':                [{ caen: 'I', weight: 1.0 }],
  'comert':                [{ caen: 'G', weight: 1.0 }],
  'finante-banci':         [{ caen: 'K', weight: 1.0 }],
  'juridic':               [{ caen: 'M', weight: 1.0 }],
  'administratie-publica': [{ caen: 'O', weight: 1.0 }],
  'arte-cultura':          [{ caen: 'R', weight: 1.0 }],
  'media-comunicare':      [{ caen: 'J', weight: 0.5 }, { caen: 'R', weight: 0.5 }],
  'energie':               [{ caen: 'D', weight: 0.7 }, { caen: 'B', weight: 0.3 }],
  'imobiliare':            [{ caen: 'L', weight: 0.6 }, { caen: 'F', weight: 0.4 }],
  'auto':                  [{ caen: 'G', weight: 0.5 }, { caen: 'C', weight: 0.5 }],
  'securitate':            [{ caen: 'N', weight: 0.7 }, { caen: 'O', weight: 0.3 }],
  'curatenie-mentenanta':  [{ caen: 'N', weight: 0.6 }, { caen: 'E', weight: 0.4 }],
  'sport-fitness':         [{ caen: 'R', weight: 0.7 }, { caen: 'S', weight: 0.3 }],
};

// ═══════════════════════════════════════════════════════════════
// CALIBRARE
// ═══════════════════════════════════════════════════════════════

function getMediaDomeniuCAEN(domeniuId) {
  const mapping = domeniuCAEN[domeniuId];
  if (!mapping) return MEDIA_NATIONALA;
  return Math.round(
    mapping.reduce((sum, { caen, weight }) => sum + (salariuCAEN[caen] || MEDIA_NATIONALA) * weight, 0)
  );
}

function getCoefJudet(orasId) {
  const judet = orasJudet[orasId];
  if (!judet || !salariuJudete[judet]) return 1.0;
  return salariuJudete[judet] / MEDIA_NATIONALA;
}

// Load current data
const meserii = JSON.parse(readFileSync(join(dataDir, 'meserii.json'), 'utf-8'));
const orase = JSON.parse(readFileSync(join(dataDir, 'orase.json'), 'utf-8'));

console.log('=== Calibrare salarii cu date INS ===\n');
console.log(`Media națională INS: ${MEDIA_NATIONALA} lei net\n`);

// Show domain calibration
console.log('Medii reale pe domenii (din CAEN):');
const domeniuIds = [...new Set(meserii.map(m => m.dompiuId))];
for (const dId of domeniuIds) {
  const mediaCAEN = getMediaDomeniuCAEN(dId);
  console.log(`  ${dId}: ${mediaCAEN} lei`);
}
console.log();

// Show county coefficients for our cities
console.log('Coeficienți județe (selectiv):');
for (const oras of orase.slice(0, 10)) {
  const coef = getCoefJudet(oras.id);
  const judet = orasJudet[oras.id];
  console.log(`  ${oras.nume} (${judet}): ×${coef.toFixed(3)} = ${salariuJudete[judet]} lei`);
}
console.log();

// Calibrate each meserie
let calibrated = 0;
for (const meserie of meserii) {
  const mediaDomeniuReal = getMediaDomeniuCAEN(meserie.dompiuId);

  // Get current domain average from data
  const meseriiDomeniu = meserii.filter(m => m.dompiuId === meserie.dompiuId);
  const mediaCurrentDomeniu = Math.round(
    meseriiDomeniu.reduce((s, m) => s + m.salpiuNational.mediu, 0) / meseriiDomeniu.length
  );

  // Factor: how this meserie relates to its domain average (preserve relative position)
  const factorInDomeniu = meserie.salpiuNational.mediu / mediaCurrentDomeniu;

  // New national salary: real domain average × relative position
  const newMediu = Math.round(mediaDomeniuReal * factorInDomeniu);
  const oldMediu = meserie.salpiuNational.mediu;

  // Keep min/max ratio
  const minRatio = meserie.salpiuNational.min / oldMediu;
  const maxRatio = meserie.salpiuNational.max / oldMediu;

  meserie.salpiuNational = {
    min: Math.round(newMediu * minRatio),
    mediu: newMediu,
    max: Math.round(newMediu * maxRatio),
  };

  // Calibrate per-city salaries using real county coefficients
  for (const orasId of Object.keys(meserie.salpiuOrase)) {
    const coefJudet = getCoefJudet(orasId);

    // National salary × county coefficient, with some variation
    const cityMediu = Math.round(newMediu * coefJudet);
    const cityMin = Math.round(cityMediu * minRatio);
    const cityMax = Math.round(cityMediu * maxRatio);

    meserie.salpiuOrase[orasId] = {
      min: cityMin,
      mediu: cityMediu,
      max: cityMax,
    };
  }

  // Update FAQ salary references
  meserie.fpiIntrebari = meserie.fpiIntrebari.map(faq => {
    let raspuns = faq.raspuns;
    // Replace old salary values in FAQ answers
    if (faq.intrebare.includes('Cât câștigă')) {
      const topOras = Object.entries(meserie.salpiuOrase)
        .sort(([,a], [,b]) => b.mediu - a.mediu)[0];
      raspuns = `Salariul mediu net al unui ${meserie.nume.toLowerCase()} este de ${newMediu.toLocaleString('ro-RO')} lei pe lună. Intervalul variază între ${meserie.salpiuNational.min.toLocaleString('ro-RO')} lei și ${meserie.salpiuNational.max.toLocaleString('ro-RO')} lei, în funcție de experiență, angajator și oraș.`;
    }
    return { ...faq, raspuns };
  });

  calibrated++;
}

console.log(`Calibrate ${calibrated} meserii.\n`);

// Stats
const allMedii = meserii.map(m => m.salpiuNational.mediu);
console.log('Statistici post-calibrare:');
console.log(`  Min salariu mediu: ${Math.min(...allMedii).toLocaleString('ro-RO')} lei`);
console.log(`  Max salariu mediu: ${Math.max(...allMedii).toLocaleString('ro-RO')} lei`);
console.log(`  Media generală: ${Math.round(allMedii.reduce((a,b) => a+b, 0) / allMedii.length).toLocaleString('ro-RO')} lei`);

// Spot check per domain
console.log('\nMedii post-calibrare pe domenii:');
for (const dId of domeniuIds) {
  const dm = meserii.filter(m => m.dompiuId === dId);
  const avg = Math.round(dm.reduce((s, m) => s + m.salpiuNational.mediu, 0) / dm.length);
  const targetCAEN = getMediaDomeniuCAEN(dId);
  console.log(`  ${dId}: ${avg} lei (target CAEN: ${targetCAEN})`);
}

// Spot check: București vs Vaslui for IT
console.log('\nSpot check - Dezvoltator Software:');
const dev = meserii.find(m => m.slug === 'dezvoltator-software');
if (dev) {
  console.log(`  Național: ${dev.salpiuNational.mediu.toLocaleString('ro-RO')} lei`);
  if (dev.salpiuOrase['bucuresti']) console.log(`  București: ${dev.salpiuOrase['bucuresti'].mediu.toLocaleString('ro-RO')} lei`);
  if (dev.salpiuOrase['cluj-napoca']) console.log(`  Cluj: ${dev.salpiuOrase['cluj-napoca'].mediu.toLocaleString('ro-RO')} lei`);
  if (dev.salpiuOrase['vaslui']) console.log(`  Vaslui: ${dev.salpiuOrase['vaslui'].mediu.toLocaleString('ro-RO')} lei`);
  if (dev.salpiuOrase['botosani']) console.log(`  Botoșani: ${dev.salpiuOrase['botosani'].mediu.toLocaleString('ro-RO')} lei`);
}

// Save
writeFileSync(join(dataDir, 'meserii.json'), JSON.stringify(meserii, null, 2), 'utf-8');
console.log('\n✓ meserii.json actualizat cu salarii calibrate INS.');
