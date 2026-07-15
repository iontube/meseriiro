// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cityIndexed from './src/data/city-indexed.json' with { type: 'json' };

// Set de pagini-oraș care rămân indexate (≥1 impresie/90z GSC). Restul primesc noindex,follow
// și trebuie EXCLUSE din sitemap (nu trimitem Google pe pagini noindex).
const CITY_INDEXED = new Set(cityIndexed.keys);

// Înfășoară fiecare <table> din markdown într-un <div class="table-scroll"> (scroll orizontal pe mobil).
function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-scroll'] },
            children: [child],
          };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://meseriile.ro',
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    rehypePlugins: [rehypeTableWrap],
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      // lastmod DETERMINIST = când s-a schimbat ultima dată conținutul directorului.
      // NU new Date() (altfel sitemap-urile nemodificate primesc data build-ului la fiecare rulare).
      // Bump-uiește DOAR când chiar actualizezi datele meseriilor.
      lastmod: new Date('2026-07-03T13:00:00.000Z'),
      // /articole/* au sitemap dedicat (cu imagini) generat de scripts/sitemap-articole.mjs
      // Paginile-oraș noindex (fără trafic GSC) sunt EXCLUSE — nu trimitem Google pe pagini noindex.
      filter: (page) => {
        if (page.includes('/articole/')) return false;
        const m = page.match(/\/salariu\/([^/]+)\/([^/]+)\/$/);
        if (m) return CITY_INDEXED.has(`${m[1]}/${m[2]}`);
        return true;
      },
      serialize(item) {
        const url = item.url;
        if (url === 'https://meseriile.ro/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (url === 'https://meseriile.ro/calculator-salariu/') {
          // pagină NOUĂ (tool flagship) — lastmod real fix + prioritate de hub
          item.priority = 0.9;
          item.changefreq = 'weekly';
          item.lastmod = '2026-07-03T09:00:00.000Z';
        } else if (url.includes('/salariu-net')) {
          // secțiune NOUĂ programatică (2026-07-03)
          item.priority = url === 'https://meseriile.ro/salariu-net/' ? 0.7 : 0.6;
          item.changefreq = 'monthly';
          item.lastmod = '2026-07-03T09:00:00.000Z';
        } else if (
          url.match(/\/domenii\/$/) ||
          url.match(/\/meserii\/$/) ||
          url.match(/\/orase\/$/) ||
          url.match(/\/competente\/$/) ||
          url.match(/\/salariu\/$/)
        ) {
          item.priority = 0.9;
        } else if (
          url.match(/\/meserii\/[^/]+\/$/) ||
          url.match(/\/domenii\/[^/]+\/$/)
        ) {
          item.priority = 0.8;
        } else if (
          url.match(/\/salariu\/[^/]+\/$/) ||
          url.match(/\/orase\/[^/]+\/$/) ||
          url.match(/\/competente\/[^/]+\/$/)
        ) {
          item.priority = 0.7;
        } else if (url.match(/\/salariu\/[^/]+\/[^/]+\/$/)) {
          item.priority = 0.6;
        } else {
          item.priority = 0.5;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
