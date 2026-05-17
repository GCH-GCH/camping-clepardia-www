// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: Replace with the final production domain before launch.
  site: 'https://twojadomena.pl',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'pl',
        locales: {
          pl: 'pl',
          en: 'en',
          de: 'de',
          it: 'it',
          fr: 'fr',
          es: 'es',
          nl: 'nl',
          cs: 'cs',
          sk: 'sk',
          sv: 'sv',
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
