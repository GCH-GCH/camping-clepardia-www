// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

const reservationApiDevPlugin = () => ({
  name: 'reservation-api-dev-mock',
  configureServer(server) {
    server.middlewares.use('/api/reservation', (req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.setHeader('allow', 'POST, OPTIONS');
        res.end();
        return;
      }

      if (req.method !== 'POST') {
        next();
        return;
      }

      const chunks = [];
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      req.on('end', () => {
        let payload = {};
        try {
          const rawBody = Buffer.concat(chunks).toString('utf8');
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          res.statusCode = 400;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, message: 'Invalid JSON payload.' }));
          return;
        }

        const errors = {};
        if (!String(payload.fullName || '').trim()) errors.fullName = 'Podaj imię i nazwisko.';
        if (!String(payload.email || '').trim()) errors.email = 'Podaj adres email.';
        if (!String(payload.arrivalIso || '').trim()) errors.arrival = 'Podaj datę przyjazdu.';
        if (!String(payload.departureIso || '').trim()) errors.departure = 'Podaj datę wyjazdu.';
        if (!String(payload.stayType || '').trim()) errors.stayType = 'Wybierz typ pobytu.';
        if (!payload.quietConsent) errors.quietConsent = 'Potwierdź zasady ciszy nocnej.';
        if (!payload.consent) errors.consent = 'Zaakceptuj kontakt zwrotny.';

        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.setHeader('cache-control', 'no-store');

        if (Object.keys(errors).length) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, errors }));
          return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          mode: 'mock',
          inquiryId: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
          message: 'Reservation enquiry accepted in local dev mock mode.',
        }));
      });
      req.on('error', () => {
        res.statusCode = 400;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, message: 'Invalid request stream.' }));
      });
    });
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://www.clepardia.com.pl',
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
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [reservationApiDevPlugin(), tailwindcss()]
  }
});
