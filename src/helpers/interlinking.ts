import type { Meserie, Domeniu, Competenta, Oras } from './types';
import { getMeseriiByDomeniu, getMeseriiByCompetenta, domenii, competente, meserii, orase, formatSalariu } from './data';

export interface InternalLink {
  href: string;
  text: string;
  title?: string;
}

export function getMeserieSiloLinks(meserie: Meserie): {
  domeniu: InternalLink;
  salariu: InternalLink;
  competente: InternalLink[];
  meseriiSimilare: InternalLink[];
} {
  const domeniu = domenii.find(d => d.id === meserie.dompiuId);

  return {
    domeniu: {
      href: `/domenii/${domeniu?.slug || ''}/`,
      text: domeniu?.nume || '',
      title: `Meserii în domeniul ${domeniu?.nume}`,
    },
    salariu: {
      href: `/salariu/${meserie.slug}/`,
      text: `Salariu ${meserie.nume}`,
      title: `Salariu ${meserie.nume} - Date actualizate`,
    },
    competente: meserie.competente
      .map(cId => {
        const comp = competente.find(c => c.id === cId);
        if (!comp) return null;
        return {
          href: `/competente/${comp.slug}/`,
          text: comp.nume,
          title: `Competența: ${comp.nume}`,
        };
      })
      .filter((l): l is InternalLink => l !== null),
    meseriiSimilare: meserie.meseriiSimilare
      .map(slug => {
        const m = meserii.find(mes => mes.slug === slug);
        if (!m) return null;
        return {
          href: `/meserii/${m.slug}/`,
          text: m.nume,
          title: `${m.nume} - descriere, salariu și competențe`,
        };
      })
      .filter((l): l is InternalLink => l !== null),
  };
}

export function getDomeniuSiloLinks(domeniu: Domeniu): InternalLink[] {
  return getMeseriiByDomeniu(domeniu.id).map(m => ({
    href: `/meserii/${m.slug}/`,
    text: m.nume,
    title: `${m.nume} - Descriere, salariu și competențe`,
  }));
}

export function getCompetentaSiloLinks(competenta: Competenta): InternalLink[] {
  return getMeseriiByCompetenta(competenta.id).map(m => ({
    href: `/meserii/${m.slug}/`,
    text: m.nume,
    title: `${m.nume} - necesită ${competenta.nume}`,
  }));
}

export function getRelatedDomenii(currentDomeniuId: string, limit = 4): InternalLink[] {
  return domenii
    .filter(d => d.id !== currentDomeniuId)
    .slice(0, limit)
    .map(d => ({
      href: `/domenii/${d.slug}/`,
      text: d.nume,
      title: `Meserii în domeniul ${d.nume}`,
    }));
}

export function getPopularMeserii(limit = 6): InternalLink[] {
  return meserii
    .filter(m => m.nivelCerere === 'ridicat')
    .slice(0, limit)
    .map(m => ({
      href: `/meserii/${m.slug}/`,
      text: m.nume,
      title: `${m.nume} - meserie cu cerere ridicată`,
    }));
}

// ── SILO ORAȘE ──

export function getOrasSiloLinks(orasId: string): InternalLink[] {
  return orase
    .filter(o => o.id !== orasId)
    .slice(0, 6)
    .map(o => ({
      href: `/orase/${o.id}/`,
      text: o.nume,
      title: `Salarii și meserii în ${o.nume}`,
    }));
}

export function getTopSalaryMeseriiInOras(orasId: string, limit = 15): Array<{ meserie: Meserie; salariu: { min: number; mediu: number; max: number } }> {
  return meserii
    .filter(m => m.salpiuOrase[orasId])
    .map(m => ({ meserie: m, salariu: m.salpiuOrase[orasId] }))
    .sort((a, b) => b.salariu.mediu - a.salariu.mediu)
    .slice(0, limit);
}

export function getOraseByRegiune(): Record<string, typeof orase> {
  const grouped: Record<string, typeof orase> = {};
  for (const oras of orase) {
    if (!grouped[oras.regiune]) grouped[oras.regiune] = [];
    grouped[oras.regiune].push(oras);
  }
  return grouped;
}

// ── CROSS-SILO LINKS ──

/** Top salarii din domeniu - pentru pagina de domeniu */
export function getTopSalaryInDomeniu(domeniuId: string, limit = 5): InternalLink[] {
  return getMeseriiByDomeniu(domeniuId)
    .sort((a, b) => b.salpiuNational.mediu - a.salpiuNational.mediu)
    .slice(0, limit)
    .map(m => ({
      href: `/salariu/${m.slug}/`,
      text: `Salariu ${m.nume}: ${formatSalariu(m.salpiuNational.mediu)}/lună`,
      title: `Salariu ${m.nume} pe orașe`,
    }));
}

/** Competențe unice din domeniu - pentru pagina de domeniu */
export function getCompetenteInDomeniu(domeniuId: string): InternalLink[] {
  const compIds = new Set<string>();
  for (const m of getMeseriiByDomeniu(domeniuId)) {
    for (const c of m.competente) compIds.add(c);
  }
  return [...compIds]
    .map(id => competente.find(c => c.id === id))
    .filter((c): c is Competenta => c !== undefined)
    .slice(0, 8)
    .map(c => ({
      href: `/competente/${c.slug}/`,
      text: c.nume,
      title: `Competența: ${c.nume}`,
    }));
}

/** Top salarii pentru o competență - pentru pagina de competență */
export function getTopSalaryForCompetenta(competentaId: string, limit = 5): InternalLink[] {
  return getMeseriiByCompetenta(competentaId)
    .sort((a, b) => b.salpiuNational.mediu - a.salpiuNational.mediu)
    .slice(0, limit)
    .map(m => ({
      href: `/salariu/${m.slug}/`,
      text: `Salariu ${m.nume}: ${formatSalariu(m.salpiuNational.mediu)}/lună`,
      title: `Salariu ${m.nume} pe orașe`,
    }));
}

/** Meserii individuale dintr-un oraș - pentru pagina de oraș */
export function getMeseriiLinksForOras(orasId: string, limit = 10): InternalLink[] {
  return meserii
    .filter(m => m.salpiuOrase[orasId])
    .sort((a, b) => b.salpiuNational.mediu - a.salpiuNational.mediu)
    .slice(0, limit)
    .map(m => ({
      href: `/meserii/${m.slug}/`,
      text: m.nume,
      title: `${m.nume} - descriere completă`,
    }));
}

/** Orașe frate pentru aceeași meserie - salariu/slug/oras */
export function getSiblingCityLinks(meserieSlug: string, currentOrasId: string, limit = 6): InternalLink[] {
  const m = meserii.find(mes => mes.slug === meserieSlug);
  if (!m) return [];
  return orase
    .filter(o => o.id !== currentOrasId && m.salpiuOrase[o.id])
    .sort((a, b) => b.populatie - a.populatie)
    .slice(0, limit)
    .map(o => ({
      href: `/salariu/${meserieSlug}/${o.id}/`,
      text: `${o.nume}: ${formatSalariu(m.salpiuOrase[o.id].mediu)}`,
      title: `Salariu ${m.nume} în ${o.nume}`,
    }));
}

/** Top 3 orașe ca salariu pentru o meserie */
export function getTopCitiesForMeserie(meserieSlug: string, limit = 3): Array<{ oras: Oras; salariu: { min: number; mediu: number; max: number } }> {
  const m = meserii.find(mes => mes.slug === meserieSlug);
  if (!m) return [];
  return orase
    .filter(o => m.salpiuOrase[o.id])
    .map(o => ({ oras: o, salariu: m.salpiuOrase[o.id] }))
    .sort((a, b) => b.salariu.mediu - a.salariu.mediu)
    .slice(0, limit);
}

/** Media salarială a domeniului */
export function getDomeniuAverageSalary(domeniuId: string): number {
  const meseriiDom = getMeseriiByDomeniu(domeniuId);
  if (meseriiDom.length === 0) return 0;
  return Math.round(meseriiDom.reduce((sum, m) => sum + m.salpiuNational.mediu, 0) / meseriiDom.length);
}

/** Top salarii global - pentru homepage și /salariu/ index */
export function getTopSalaryMeserii(limit = 8): InternalLink[] {
  return meserii
    .sort((a, b) => b.salpiuNational.mediu - a.salpiuNational.mediu)
    .slice(0, limit)
    .map(m => ({
      href: `/salariu/${m.slug}/`,
      text: `${m.nume}: ${formatSalariu(m.salpiuNational.mediu)}/lună`,
      title: `Salariu ${m.nume} - date pe orașe`,
    }));
}
