import fs from 'fs';
const C = JSON.parse(fs.readFileSync('/sites/_doorways/oauth_gsc_creds.json', 'utf8'));
const SITE = 'https://meseriile.ro/';
const AT = (await (await fetch(C.token_uri, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: C.client_id, client_secret: C.client_secret, refresh_token: C.refresh_token, grant_type: 'refresh_token' }) })).json()).access_token;
const q = async b => {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, { method: 'POST', headers: { Authorization: `Bearer ${AT}`, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  const j = await r.json(); if (j.error) throw new Error(JSON.stringify(j.error).slice(0, 300)); return j.rows || [];
};
const R = { startDate: '2026-07-03', endDate: '2026-08-01' };
const ART = '/articole/';

// --- 1. query x page pentru articole, cu pozitie
console.log('=== ARTICOLE: query x page (top 40 dupa impresii) ===');
const rows = await q({ ...R, dimensions: ['page', 'query'], dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: ART }] }], rowLimit: 5000 });
rows.sort((a, b) => b.impressions - a.impressions);
for (const r of rows.slice(0, 40)) {
  const [p, kw] = r.keys;
  console.log(String(r.impressions).padStart(5), 'cl', String(r.clicks).padStart(3), 'poz', (r.position || 0).toFixed(1).padStart(5), '|', p.replace('https://meseriile.ro/articole/', '').replace(/\/$/, '').padEnd(45), '|', kw);
}

// --- 2. distributia impresiilor pe bucket de pozitie, per articol
console.log('\n=== DISTRIBUTIE POZITIE per articol (impresii) ===');
const byPage = {};
for (const r of rows) {
  const p = r.keys[0].replace('https://meseriile.ro/articole/', '').replace(/\/$/, '');
  byPage[p] = byPage[p] || { top3: 0, p4_10: 0, p11_20: 0, p21: 0, tot: 0, clicks: 0, kws: 0 };
  const b = byPage[p]; const pos = r.position || 99;
  b.tot += r.impressions; b.clicks += r.clicks; b.kws++;
  if (pos <= 3) b.top3 += r.impressions; else if (pos <= 10) b.p4_10 += r.impressions; else if (pos <= 20) b.p11_20 += r.impressions; else b.p21 += r.impressions;
}
console.log('pagina'.padEnd(45), 'impr  clic  kw | top3  4-10  11-20  21+');
for (const [p, b] of Object.entries(byPage).sort((a, b2) => b2[1].tot - a[1].tot))
  console.log(p.padEnd(45), String(b.tot).padStart(5), String(b.clicks).padStart(4), String(b.kws).padStart(4), '|',
    String(b.top3).padStart(5), String(b.p4_10).padStart(5), String(b.p11_20).padStart(6), String(b.p21).padStart(5));

// --- 3. pilot avion in detaliu
console.log('\n=== PILOT AVION: toate query-urile ===');
const pilot = rows.filter(r => r.keys[0].includes('pilot-avion')).sort((a, b) => b.impressions - a.impressions);
for (const r of pilot.slice(0, 30)) console.log(String(r.impressions).padStart(5), 'cl', r.clicks, 'poz', (r.position || 0).toFixed(1).padStart(5), '|', r.keys[1]);
console.log('total query-uri:', pilot.length, '| impresii:', pilot.reduce((a, r) => a + r.impressions, 0));

// --- 4. pilot avion pe device
console.log('\n=== PILOT AVION pe device ===');
for (const r of await q({ ...R, dimensions: ['device'], dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: 'pilot-avion' }] }], rowLimit: 10 }))
  console.log(r.keys[0].padEnd(8), 'impr', String(r.impressions).padStart(4), 'cl', r.clicks, 'poz', (r.position || 0).toFixed(1));

// --- 5. site-wide: unde suntem pe pozitii 4-20 cu impresii mari (oportunitati reale)
console.log('\n=== SITE-WIDE: query-uri cu impresii mari si pozitie 4-20 (top 30) ===');
const all = await q({ ...R, dimensions: ['query'], rowLimit: 25000 });
const opp = all.filter(r => (r.position || 99) > 3.5 && (r.position || 99) <= 20 && r.impressions >= 40);
opp.sort((a, b) => b.impressions - a.impressions);
for (const r of opp.slice(0, 30)) console.log(String(r.impressions).padStart(5), 'cl', String(r.clicks).padStart(3), 'poz', (r.position || 0).toFixed(1).padStart(5), '|', r.keys[0]);
console.log('total astfel de query-uri:', opp.length, '| impresii cumulate:', opp.reduce((a, r) => a + r.impressions, 0));

// --- 6. pozitie medie pe tip de pagina
console.log('\n=== POZITIE MEDIE ponderata pe tip de pagina ===');
const pg = await q({ ...R, dimensions: ['page'], rowLimit: 25000 });
const buck = {};
for (const r of pg) {
  const p = r.keys[0].replace('https://meseriile.ro', '');
  const k = p.startsWith('/articole') ? 'articole' : p.startsWith('/salariu/') ? (p.split('/').filter(Boolean).length >= 3 ? 'salariu-oras' : 'salariu-national') : p === '/' ? 'home' : 'director';
  buck[k] = buck[k] || { i: 0, c: 0, ps: 0 };
  buck[k].i += r.impressions; buck[k].c += r.clicks; buck[k].ps += (r.position || 0) * r.impressions;
}
for (const [k, v] of Object.entries(buck))
  console.log(k.padEnd(18), 'impr', String(v.i).padStart(6), 'clic', String(v.c).padStart(5), 'CTR', ((v.c / v.i) * 100).toFixed(2) + '%', 'poz medie', (v.ps / v.i).toFixed(1));

fs.writeFileSync('/sites/meseriiro-work/research/gsc_queries.json', JSON.stringify(all, null, 0));
console.log('\n(salvat gsc_queries.json:', all.length, 'query-uri)');
