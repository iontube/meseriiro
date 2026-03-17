// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://meseriile.ro',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        const url = item.url;
        if (url === 'https://meseriile.ro/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
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
