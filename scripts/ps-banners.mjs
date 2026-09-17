// Genereaza banners.json din API-ul Profitshare (campanii cu bannere + valabilitate).
// Ruleaza zilnic (cron) -> scrie banners.json in proiectul de imagini -> deploy pe img.meseriile.ro.
// Componenta <CampaignBanner> il citeste client-side si randeaza bannerul valid.
// Vezi reteta API in memoria reference_profitshare_api.
// Uz: node scripts/ps-banners.mjs [--out=/cale/banners.json]
import crypto from 'node:crypto';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

const API_USER = process.env.PS_API_USER || 'lucian_grecu_68e7a5acc020d';
// Cheia NU sta in cod (repo public). Pe server: scripts/.ps-api-key (gitignorat); altfel PS_API_KEY.
const API_KEY = process.env.PS_API_KEY || (existsSync(new URL('./.ps-api-key', import.meta.url)) ? readFileSync(new URL('./.ps-api-key', import.meta.url), 'utf8').trim() : '');
if (!API_KEY) { console.error('Lipseste cheia Profitshare: PS_API_KEY sau scripts/.ps-api-key'); process.exit(1); }
const BASE = 'https://api.profitshare.ro';
// Deeplink afiliat (acelasi cont ca linkurile de produs) -> trackuieste clickul.
const DEEPLINK = url => 'https://l.profitshare.ro/lps/9/ZmA/?redirect=' + encodeURIComponent(url);
// Faza 1: doar eMAG. Adauga aici advertiseri ca sa extinzi.
const ADVERTISERS = { 35: 'emag' };

const OUT = (process.argv.find(a => a.startsWith('--out=')) || '').split('=')[1]
  || '/sites/meseriile-img-work/banners.json';

async function ps(api, params = {}) {
  const qs = Object.keys(params).length ? decodeURIComponent(new URLSearchParams(params).toString()) : '';
  const date = new Date().toUTCString();
  const sig = 'GET' + api + '/?' + qs + '/' + API_USER + date;
  const auth = crypto.createHmac('sha1', API_KEY).update(sig).digest('hex');
  const res = await fetch(`${BASE}/${api}/?${qs}`, {
    headers: { Date: date, 'X-PS-Client': API_USER, 'X-PS-Accept': 'json', 'X-PS-Auth': auth },
  });
  if (!res.ok) throw new Error(`${api} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const decodeEnt = s => (s || '')
  .replace(/&icirc;/g, 'i').replace(/&acirc;/g, 'a').replace(/&amp;/g, '&')
  .replace(/&([a-z]);/gi, '$1').replace(/&#\d+;/g, '');

// Colecteaza toate campaniile (paginat)
const all = [];
let page = 1, totalPages = 1;
do {
  const r = await ps('affiliate-campaigns', { page });
  const res = r.result || {};
  all.push(...(res.campaigns || []));
  totalPages = res.paginator?.totalPages || 1;
  page++;
} while (page <= totalPages && page <= 20);

const now = Date.now();
// Pastreaza doar advertiserii alesi + campaniile NEexpirate (clientul face verificarea fina la afisare).
const campaigns = all
  .filter(c => ADVERTISERS[c.advertiser_id])
  .filter(c => {
    const end = new Date((c.endDate || '').replace(' ', 'T') + '+03:00').getTime();
    return !c.endDate || isNaN(end) || end >= now;
  })
  .map(c => ({
    id: c.id,
    advertiser: ADVERTISERS[c.advertiser_id],
    name: decodeEnt(c.name),
    start: c.startDate || null,
    end: c.endDate || null,
    link: DEEPLINK(c.url),
    banners: Object.fromEntries(Object.entries(c.banners || {}).map(([size, b]) => [
      size, { w: b.width, h: b.height, src: (b.src || '').startsWith('//') ? 'https:' + b.src : b.src },
    ])),
  }))
  .filter(c => Object.keys(c.banners).length);

// Detectie de schimbare: compara DOAR campaniile (nu si `generated`, care difera mereu).
// Cronul redeployeaza img.meseriile.ro doar cand se schimba ceva (exit 0 = schimbat, 10 = neschimbat).
const newStr = JSON.stringify(campaigns);
if (existsSync(OUT)) {
  try {
    if (JSON.stringify((JSON.parse(readFileSync(OUT, 'utf8')).campaigns) || []) === newStr) {
      console.log(`banners.json NESCHIMBAT (${campaigns.length} campanii) — skip deploy`);
      process.exit(10);
    }
  } catch { /* fisier corupt -> rescriem */ }
}

const out = { generated: new Date().toISOString(), campaigns };
writeFileSync(OUT, JSON.stringify(out));
console.log(`banners.json ACTUALIZAT: ${campaigns.length} campanii -> ${OUT} (deploy necesar)`);
campaigns.forEach(c => console.log(`  ${c.advertiser} #${c.id} "${c.name}" (${c.start} -> ${c.end}) [${Object.keys(c.banners).join(',')}]`));
