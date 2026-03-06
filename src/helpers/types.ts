export interface Oras {
  id: string;
  nume: string;
  populatie: number;
  regiune: string;
}

export interface Domeniu {
  id: string;
  nume: string;
  slug: string;
  descriere: string;
  icon: string;
  meseriiCount: number;
  metaTitle: string;
  metaDescription: string;
}

export interface FAQItem {
  intrebare: string;
  raspuns: string;
}

export interface SalariuRange {
  min: number;
  mediu: number;
  max: number;
}

export interface Meserie {
  id: string;
  slug: string;
  nume: string;
  codCOR: string;
  dompiuId: string;
  descriere: string;
  ceFaceConcret: string;
  responsabilitati: string[];
  competente: string[];
  studiiNecesare: string;
  conditiiMunca: string;
  evolutieCariera: string;
  nivelCerere: 'scazut' | 'mediu' | 'ridicat';
  salpiuNational: SalariuRange;
  salpiuOrase: Record<string, SalariuRange>;
  meseriiSimilare: string[];
  fpiIntrebari: FAQItem[];
  metaTitle: string;
  metaDescription: string;
}

export interface Competenta {
  id: string;
  slug: string;
  nume: string;
  descriere: string;
  categorie: string;
  meseriiRelevante: string[];
  metaTitle: string;
  metaDescription: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}
