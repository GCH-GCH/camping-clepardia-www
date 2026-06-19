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
        const services = Array.isArray(payload.services) ? payload.services.filter((item) => Number(item?.qty || 0) > 0) : [];
        const addons = Array.isArray(payload.addons) ? payload.addons.filter(Boolean) : [];
        if (!String(payload.fullName || '').trim()) errors.fullName = 'Podaj imię i nazwisko.';
        if (!String(payload.email || '').trim() && !String(payload.phone || '').trim()) errors.contact = 'Podaj adres email albo telefon.';
        if (!String(payload.country || '').trim()) errors.country = 'Wybierz kraj.';
        if (!String(payload.arrivalIso || '').trim()) errors.arrival = 'Podaj datę przyjazdu.';
        if (!String(payload.departureIso || '').trim()) errors.departure = 'Podaj datę wyjazdu.';
        if (!String(payload.stayType || '').trim()) errors.stayType = 'Wybierz typ pobytu.';
        if (!services.length && !addons.length) errors.services = 'Wybierz przynajmniej jedną opcję pobytu lub usługę.';
        if (!payload.quietConsent) errors.quietConsent = 'Potwierdź zasady ciszy nocnej.';
        if (!payload.consent) errors.consent = 'Zaakceptuj kontakt zwrotny.';
        if (!payload.privacyConsent) errors.privacyConsent = 'Zaakceptuj zgodę na przetwarzanie danych.';

        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.setHeader('cache-control', 'no-store');

        if (Object.keys(errors).length) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, errors }));
          return;
        }

        const estimatedTotal = String(payload.estimatedTotal || payload.calculatorSummary?.total || '').trim();
        const ccSystemDraft = {
          source: 'website-reservation-dev-mock',
          customer: {
            fullName: String(payload.fullName || '').trim(),
            email: String(payload.email || '').trim(),
            phone: String(payload.phone || '').trim(),
            country: String(payload.country || '').trim(),
            language: String(payload.contactLanguage || payload.locale || '').trim(),
          },
          stay: {
            type: String(payload.stayType || payload.selectedStayMode || '').trim(),
            arrivalIso: String(payload.arrivalIso || '').trim(),
            departureIso: String(payload.departureIso || '').trim(),
            nights: Number(payload.nights || 0),
            estimatedTotal,
            currencyEstimate: String(payload.currencyEstimate || payload.calculatorSummary?.currencyEstimate || '').trim(),
            currencyDisclaimer: String(payload.currencyDisclaimer || payload.calculatorSummary?.currencyDisclaimer || '').trim(),
            vehicleDetails: payload.vehicleDetails || {},
          },
          services,
          originalMessage: String(payload.message || '').trim(),
        };

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          mode: 'mock',
          inquiryId: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
          mail: {
            reception: {
              provider: 'mock',
              delivered: false,
              reason: 'Local dev Vite mock - mail body prepared but not sent.',
            },
            autoresponder: String(payload.email || '').trim()
              ? {
                  provider: 'mock',
                  delivered: false,
                  reason: 'Local dev Vite mock - autoresponder prepared but not sent.',
                }
              : {
                  provider: 'mock',
                  delivered: false,
                  reason: 'Customer email missing - autoresponder skipped.',
                },
          },
          ccSystemDraft,
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
