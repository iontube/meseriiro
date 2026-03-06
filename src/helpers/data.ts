import type { Domeniu, Meserie, Oras, Competenta } from './types';
import domeniiData from '../data/domenii.json';
import meseriiData from '../data/meserii.json';
import oraseData from '../data/orase.json';
import competenteData from '../data/competente.json';

export const domenii: Domeniu[] = domeniiData as Domeniu[];
export const meserii: Meserie[] = meseriiData as Meserie[];
export const orase: Oras[] = oraseData as Oras[];
export const competente: Competenta[] = competenteData as Competenta[];

export function getDomeniuBySlug(slug: string): Domeniu | undefined {
  return domenii.find(d => d.slug === slug);
}

export function getMeserieBySlug(slug: string): Meserie | undefined {
  return meserii.find(m => m.slug === slug);
}

export function getOrasById(id: string): Oras | undefined {
  return orase.find(o => o.id === id);
}

export function getCompetentaBySlug(slug: string): Competenta | undefined {
  return competente.find(c => c.slug === slug);
}

export function getMeseriiByDomeniu(domeniuId: string): Meserie[] {
  return meserii.filter(m => m.dompiuId === domeniuId);
}

export function getMeseriiByCompetenta(competentaId: string): Meserie[] {
  return meserii.filter(m => m.competente.includes(competentaId));
}

export function getMeseriiSimilare(meserie: Meserie): Meserie[] {
  return meserie.meseriiSimilare
    .map(slug => getMeserieBySlug(slug))
    .filter((m): m is Meserie => m !== undefined);
}

export function getDomeniuForMeserie(meserie: Meserie): Domeniu | undefined {
  return domenii.find(d => d.id === meserie.dompiuId);
}

export function getCompetentePentruMeserie(meserie: Meserie): Competenta[] {
  return meserie.competente
    .map(id => competente.find(c => c.id === id))
    .filter((c): c is Competenta => c !== undefined);
}

export function getOraseWithSalariu(meserie: Meserie): Array<Oras & { salariu: { min: number; mediu: number; max: number } }> {
  return orase
    .filter(o => meserie.salpiuOrase[o.id])
    .map(o => ({
      ...o,
      salariu: meserie.salpiuOrase[o.id],
    }));
}

export function formatSalariu(val: number): string {
  return val.toLocaleString('ro-RO') + ' lei';
}

export function getNivelCerereLabel(nivel: string): string {
  const labels: Record<string, string> = {
    scazut: 'Scăzut',
    mediu: 'Mediu',
    ridicat: 'Ridicat',
  };
  return labels[nivel] || nivel;
}

export function getNivelCerereColor(nivel: string): string {
  const colors: Record<string, string> = {
    scazut: 'text-amber-400',
    mediu: 'text-blue-400',
    ridicat: 'text-emerald-400',
  };
  return colors[nivel] || 'text-slate-400';
}
