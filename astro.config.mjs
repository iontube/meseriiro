// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

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

// Slot de banner de campanie (afiliere). Markup identic cu CampaignBanner.astro; stil din global.css;
// logica din CampaignBannerScript.astro (inclus in Layout) care scaneaza toate [data-cb].
function bannerNode() {
  return {
    type: 'element', tagName: 'aside',
    properties: { className: ['cb'], 'data-cb': '', 'data-format': 'rectangle', ariaLabel: 'Publicitate', hidden: true },
    children: [
      { type: 'element', tagName: 'span', properties: { className: ['cb-label'] }, children: [{ type: 'text', value: 'Publicitate' }] },
      { type: 'element', tagName: 'a', properties: { className: ['cb-link'], target: '_blank', rel: ['sponsored', 'noopener', 'nofollow'] }, children: [
        { type: 'element', tagName: 'img', properties: { className: ['cb-img'], decoding: 'async', alt: '' }, children: [] },
      ] },
    ],
  };
}
// Insereaza bannere IN CONTENTUL articolului, intre sectiuni (inainte de un <h2>), nu la final.
function rehypeArticleBanner() {
  return (tree) => {
    const h2 = [];
    tree.children.forEach((n, i) => { if (n.type === 'element' && n.tagName === 'h2') h2.push(i); });
    if (h2.length < 3) return; // articol prea scurt -> fara in-content
    const positions = [h2[2]]; // inainte de a 3-a sectiune (dupa intro + 2 sectiuni citite)
    if (h2.length >= 6) {
      const later = h2[Math.floor(h2.length * 0.7)];
      if (later - h2[2] >= 2) positions.push(later);
    }
    positions.sort((a, b) => b - a).forEach((idx) => tree.children.splice(idx, 0, bannerNode()));
  };
}

export default defineConfig({
  site: 'https://meseriile.ro',
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    // ⛔ rehypeArticleBanner DEZACTIVAT 2026-08-03 (bannere afiliere scoase, vezi CampaignBanner.astro).
    // Ca sa reactivezi: adauga-l inapoi in lista si pune ADS=true in CampaignBanner.astro.
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
      // /articole/* au sitemap dedicat (cu imagini) generat de scripts/sitemap-articole.mjs.
      // Toate paginile-oraș sunt acum indexabile → intră în sitemap (strategie afiliere, nu AdSense).
      filter: (page) => !page.includes('/articole/'),
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
        } else if (url === 'https://meseriile.ro/cod-cor/') {
          // hub nou: nomenclatorul COR (2026-09-02)
          item.priority = 0.9;
          item.changefreq = 'monthly';
          item.lastmod = '2026-09-02T09:00:00.000Z';
        } else if (url.match(/\/cod-cor\/grupa\/[^/]+\/$/)) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
          item.lastmod = '2026-09-02T09:00:00.000Z';
        } else if (url.match(/\/cod-cor\/[^/]+\/$/)) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
          item.lastmod = '2026-09-02T09:00:00.000Z';
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
