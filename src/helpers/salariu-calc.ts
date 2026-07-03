/**
 * Motor de calcul salariu net <-> brut 2026 (sursă unică de adevăr).
 * Folosit ATÂT server-side (paginile /salariu-net/ randează defalcarea statică)
 * CÂT ȘI client-side (scriptul din SalaryCalculator.astro îl importă bundled).
 * Params 2026 S2 (de la 1 iul 2026). Vezi metodologia din /despre-date/.
 */
export const SAL_PARAMS = {
  minim: 4325,
  cas: 0.25,
  cass: 0.10,
  impozit: 0.10,
  cam: 0.0225,
  pragDeducere: 6325, // minim + 2.000 lei
  facilitate: 200,    // lei neimpozabili la salariul minim (iul-dec 2026)
  oreLunar: 166.67,
} as const;

export interface SalOpts {
  persoane?: number;
  tichete?: number; // valoare lunară totală tichete (zile × valoare)
  tineri?: boolean; // deducere suplimentară sub 26 ani
}

export interface SalResult {
  brut: number;
  cas: number;
  cass: number;
  deducere: number;
  impozit: number;
  netSalariu: number;
  ticheteNet: number;
  net: number;
  cost: number;
  ora: number;
}

// Deducere personală de bază = procent din grilă (art. 77) × venitul BRUT, rotunjit la 10 lei în sus.
export function deducereBaza(brut: number, persoane: number): number {
  const P = SAL_PARAMS;
  if (brut > P.pragDeducere) return 0;
  // 20% la nivelul minimului, -0,5 pp pentru fiecare tranșă de 50 lei peste minim
  const trepte = Math.ceil(Math.max(0, brut - P.minim) / 50);
  let pct = Math.max(0, 20 - 0.5 * trepte);
  const p = Math.max(0, persoane | 0);
  pct += p === 0 ? 0 : (p >= 4 ? 25 : p * 5);
  if (pct <= 0) return 0;
  return Math.ceil((brut * pct / 100) / 10) * 10;
}

export function brutToNet(brut: number, o: SalOpts = {}): SalResult {
  const P = SAL_PARAMS;
  const laMinim = Math.abs(brut - P.minim) < 0.5;
  const facil = laMinim ? P.facilitate : 0;
  const baza = brut - facil;
  const cas = Math.round(baza * P.cas);
  const cass = Math.round(baza * P.cass);
  let deducere = deducereBaza(brut, o.persoane || 0);
  if (o.tineri) deducere += Math.round(0.15 * P.minim);
  const bazaImpozit = Math.max(0, baza - cas - cass - deducere);
  const impozit = Math.round(bazaImpozit * P.impozit);
  const netSalariu = brut - cas - cass - impozit;

  const tichete = Math.max(0, o.tichete || 0);
  let cassTichete = 0, impozitTichete = 0, ticheteNet = 0;
  if (tichete > 0) {
    cassTichete = Math.round(tichete * P.cass);
    impozitTichete = Math.round((tichete - cassTichete) * P.impozit);
    ticheteNet = tichete - cassTichete - impozitTichete;
  }

  const cam = Math.round(brut * P.cam);
  return {
    brut,
    cas, cass, deducere, impozit,
    netSalariu,
    ticheteNet,
    net: netSalariu + ticheteNet,
    cost: brut + cam + tichete,
    ora: brut / P.oreLunar,
  };
}

// Net -> Brut prin căutare binară pe funcția monotonă brutToNet.
export function netToBrut(netTinta: number, o: SalOpts = {}): SalResult {
  let lo = 1, hi = netTinta * 2.2 + 2000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (brutToNet(mid, o).net < netTinta) lo = mid; else hi = mid;
  }
  return brutToNet(Math.round((lo + hi) / 2), o);
}
