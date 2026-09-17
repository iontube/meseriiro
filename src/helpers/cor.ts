import corData from '../data/cor.json';
import { meserii } from './data';
import type { Meserie } from './types';

export interface CorInrudita { cod: string; den: string; areaPagina: boolean; }
export interface CorMeserieRef { slug: string; nume: string; }
export interface CorPagina {
  cod: string;
  denumire: string;
  slug: string;
  grupaMajora: string;
  grupaBaza: string;
  meserii: CorMeserieRef[];
  inrudite: CorInrudita[];
}
export interface CorGrupa {
  cifra: string;
  slug: string;
  nume: string;
  oficial: string;
  descriere: string;
  nrOcupatiiOficiale: number;
}

export const corActualizat: string = corData.actualizat;
export const corOrdin: string = corData.ordin;
export const corMonitor: string = corData.monitor;
export const corTotalOficial: number = corData.totalOcupatiiOficiale;
export const corGrupe: CorGrupa[] = corData.grupe as CorGrupa[];
export const corPagini: CorPagina[] = corData.pagini as CorPagina[];

export function getCorByCod(cod: string): CorPagina | undefined {
  return corPagini.find(p => p.cod === cod);
}

export function getCorBySlug(slug: string): CorPagina | undefined {
  return corPagini.find(p => p.slug === slug);
}

export function getGrupaByCifra(cifra: string): CorGrupa | undefined {
  return corGrupe.find(g => g.cifra === cifra);
}

export function getPaginiPtGrupa(cifra: string): CorPagina[] {
  return corPagini.filter(p => p.grupaMajora === cifra);
}

/** Meseriile complete (cu salarii) pentru o pagina de cod. */
export function getMeseriiPtCor(p: CorPagina): Meserie[] {
  return p.meserii
    .map(r => meserii.find(m => m.slug === r.slug))
    .filter((m): m is Meserie => Boolean(m));
}

/** Salariul mediu national, mediat pe meseriile care impart codul. */
export function getSalariuMediuCor(lista: Meserie[]): number | null {
  if (!lista.length) return null;
  const s = lista.reduce((a, m) => a + m.salpiuNational.mediu, 0);
  return Math.round(s / lista.length);
}
