import { getCollection, type CollectionEntry } from 'astro:content';
import { domenii } from './data';

export type ArticolEntry = CollectionEntry<'articole'>;

// Categorii editoriale (transversale) — nu țin de o singură meserie.
const EDITORIAL: Record<string, { nume: string; descriere: string }> = {
  salarizare: {
    nume: 'Salarizare',
    descriere: 'Cum se calculează salariul net, taxe, contribuții și tot ce ține de banii din fluturaș.',
  },
  cariera: {
    nume: 'Carieră',
    descriere: 'CV, interviu, negociere, schimbare de job și dezvoltare profesională.',
  },
  'piata-muncii': {
    nume: 'Piața muncii',
    descriere: 'Tendințe, cereri de competențe și date agregate despre piața muncii din România.',
  },
};

export interface CategoryMeta {
  slug: string;
  nume: string;
  descriere: string;
  tip: 'domeniu' | 'editorial';
  /** URL-ul paginii de director corespondente (doar pt domenii). */
  directorHref?: string;
}

export function getCategoryMeta(slug: string): CategoryMeta | undefined {
  const dom = domenii.find((d) => d.slug === slug);
  if (dom) {
    return {
      slug,
      nume: dom.nume,
      descriere: dom.descriere,
      tip: 'domeniu',
      directorHref: `/domenii/${dom.slug}/`,
    };
  }
  const ed = EDITORIAL[slug];
  if (ed) return { slug, nume: ed.nume, descriere: ed.descriere, tip: 'editorial' };
  return undefined;
}

/** Toate slug-urile de categorie valide (20 domenii + editoriale). */
export function validCategorySlugs(): string[] {
  return [...domenii.map((d) => d.slug), ...Object.keys(EDITORIAL)];
}

/** Categoria + slug-ul dintr-un id de colecție "categorie/slug". */
export function splitId(id: string): { categorie: string; slug: string } {
  const [categorie, ...rest] = id.split('/');
  return { categorie, slug: rest.join('/') };
}

/** Articolele publicate (fără draft), sortate descrescător după dată. */
export async function getArticolePublicate(): Promise<ArticolEntry[]> {
  const posts = await getCollection('articole', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Articolele dintr-o categorie. */
export async function getArticoleByCategorie(categorie: string): Promise<ArticolEntry[]> {
  const posts = await getArticolePublicate();
  return posts.filter((p) => splitId(p.id).categorie === categorie);
}

/**
 * Articole similare din ACELAȘI cluster (categorie), excluzând articolul curent.
 * Prioritizează cele care împart meserii (relatedMeserii), apoi cele recente.
 */
export async function getArticoleSimilare(post: ArticolEntry, limit = 3): Promise<ArticolEntry[]> {
  const { categorie } = splitId(post.id);
  const rel = new Set(post.data.relatedMeserii);
  const all = await getArticolePublicate();
  return all
    .filter((p) => p.id !== post.id && splitId(p.id).categorie === categorie)
    .map((p) => ({ p, shared: p.data.relatedMeserii.filter((s) => rel.has(s)).length }))
    .sort((a, b) => b.shared - a.shared || b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime())
    .slice(0, limit)
    .map((x) => x.p);
}

/**
 * Articolul precedent (mai vechi) și următorul (mai nou) din ACEEAȘI categorie,
 * ordine cronologică. Pentru navigarea Precedent/Următor din josul articolului.
 */
export async function getPrevNext(post: ArticolEntry): Promise<{ prev: ArticolEntry | null; next: ArticolEntry | null }> {
  const { categorie } = splitId(post.id);
  const arr = (await getArticoleByCategorie(categorie))
    .slice()
    .sort((a, b) => a.data.pubDate.getTime() - b.data.pubDate.getTime());
  const i = arr.findIndex((p) => p.id === post.id);
  return {
    prev: i > 0 ? arr[i - 1] : null,
    next: i >= 0 && i < arr.length - 1 ? arr[i + 1] : null,
  };
}

/** Categoriile care au cel puțin un articol (pt hub-uri + navigație). */
export async function getCategoriiCuArticole(): Promise<Array<CategoryMeta & { count: number }>> {
  const posts = await getArticolePublicate();
  const counts = new Map<string, number>();
  for (const p of posts) {
    const { categorie } = splitId(p.id);
    counts.set(categorie, (counts.get(categorie) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => {
      const meta = getCategoryMeta(slug);
      return meta ? { ...meta, count } : undefined;
    })
    .filter((x): x is CategoryMeta & { count: number } => Boolean(x))
    .sort((a, b) => b.count - a.count);
}

/** URL public al imaginii de pe R2. */
export function imgUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return `https://img.meseriile.ro/articole/${path.replace(/^\/+/, '')}`;
}
