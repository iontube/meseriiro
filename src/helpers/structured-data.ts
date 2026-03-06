import type { Meserie, BreadcrumbItem, FAQItem } from './types';

const SITE_URL = 'https://meseriile.ro';
const SITE_NAME = 'Director Meserii în România';

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: SITE_URL + item.href } : {}),
    })),
  };
  return JSON.stringify(schema);
}

export function buildFAQSchema(faqItems: FAQItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(faq => ({
      '@type': 'Question',
      name: faq.intrebare,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.raspuns,
      },
    })),
  };
  return JSON.stringify(schema);
}

export function buildOccupationSchema(meserie: Meserie, domeniuNume: string): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: meserie.nume,
    description: meserie.descriere,
    occupationLocation: {
      '@type': 'Country',
      name: 'România',
    },
    estimatedSalary: {
      '@type': 'MonetaryAmountDistribution',
      name: 'Salariu net lunar',
      currency: 'RON',
      median: meserie.salpiuNational.mediu,
      percentile10: meserie.salpiuNational.min,
      percentile90: meserie.salpiuNational.max,
      unitText: 'MONTH',
    },
    educationRequirements: meserie.studiiNecesare,
    responsibilities: meserie.responsabilitati.join(', '),
    occupationalCategory: domeniuNume,
    qualifications: meserie.studiiNecesare,
  };
  return JSON.stringify(schema);
}

export function buildSalaryPageSchema(meserie: Meserie, orasNume?: string): string {
  const location = orasNume
    ? { '@type': 'City', name: orasNume, containedInPlace: { '@type': 'Country', name: 'România' } }
    : { '@type': 'Country', name: 'România' };

  const salaryData = orasNume
    ? meserie.salpiuOrase[Object.keys(meserie.salpiuOrase).find(k =>
        orasNume.toLowerCase().includes(k.replace('-', ' ')) ||
        k.includes(orasNume.toLowerCase().replace(/[ăâîșț]/g, c => {
          const m: Record<string, string> = { 'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't' };
          return m[c] || c;
        }))
      ) || ''] || meserie.salpiuNational
    : meserie.salpiuNational;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: meserie.nume,
    occupationLocation: location,
    estimatedSalary: {
      '@type': 'MonetaryAmountDistribution',
      name: 'Salariu net lunar',
      currency: 'RON',
      median: salaryData.mediu,
      percentile10: salaryData.min,
      percentile90: salaryData.max,
      unitText: 'MONTH',
    },
  };
  return JSON.stringify(schema);
}

export function buildWebPageSchema(title: string, description: string, url: string): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: SITE_URL + url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: 'ro-RO',
  };
  return JSON.stringify(schema);
}

export function buildOrasPageSchema(orasNume: string, topMeserii: Array<{ nume: string; salariuMediu: number }>): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Salarii și meserii în ${orasNume}`,
    description: `Top meserii și salarii în ${orasNume}, România.`,
    url: SITE_URL + `/orase/${orasNume.toLowerCase()}/`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    inLanguage: 'ro-RO',
    about: topMeserii.slice(0, 5).map(m => ({
      '@type': 'Occupation',
      name: m.nume,
      occupationLocation: { '@type': 'City', name: orasNume },
      estimatedSalary: {
        '@type': 'MonetaryAmountDistribution',
        currency: 'RON',
        median: m.salariuMediu,
        unitText: 'MONTH',
      },
    })),
  };
  return JSON.stringify(schema);
}

export function buildWebSiteSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Director de meserii din România: salarii pe orașe, competențe cerute, studii necesare și condiții de muncă.',
    inLanguage: 'ro-RO',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
  return JSON.stringify(schema);
}
