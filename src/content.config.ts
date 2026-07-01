import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Articole = Markdown în src/content/articole/<categorie>/<slug>.md
// Categoria vine din FOLDER (id = "<categorie>/<slug>"), nu din frontmatter.
// Interlinking spre director prin `relatedMeserii` (slug-uri de meserii → /salariu/).
const articole = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articole' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    relatedMeserii: z.array(z.string()).default([]),
    // imagini pe R2 (img.meseriile.ro) — doar calea relativă, ex "constructii/sudor/hero.webp"
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    // FAQ = accordion HTML + FAQPage JSON-LD, randat de template
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articole };
