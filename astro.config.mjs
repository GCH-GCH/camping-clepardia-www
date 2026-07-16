// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

const reservationApiDevPlugin = () => {
  const mockInquiries = [];
  const readJson = (req) => new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
  const authorized = (req) => {
    const expected = String(process.env.CC_INBOX_ACCESS_CODE || '').trim();
    return Boolean(expected) && String(req.headers['x-cc-inbox-code'] || '').trim() === expected;
  };

  return {
    name: 'reservation-api-dev-mock',
    configureServer(server) {
    server.middlewares.use('/api/inbox/list', (req, res) => {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, error: 'METHOD_NOT_ALLOWED', reason: 'Method not allowed.' }));
        return;
      }
      if (!authorized(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ ok: false, code: 'UNAUTHORIZED' }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, inquiries: mockInquiries }));
    });

    server.middlewares.use('/api/inbox/health', (req, res) => {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, code: 'METHOD_NOT_ALLOWED' }));
        return;
      }
      if (!authorized(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ ok: false, code: 'UNAUTHORIZED' }));
        return;
      }
      let supabaseHost = '';
      try {
        supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : '';
      } catch {}
      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        env: {
          supabaseUrlPresent: Boolean(String(process.env.SUPABASE_URL || '').trim()),
          serviceRolePresent: Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()),
          inboxCodePresent: Boolean(String(process.env.CC_INBOX_ACCESS_CODE || '').trim()),
          supabaseHost,
        },
        tableCheck: { ok: true, status: 200, error: null },
      }));
    });

    server.middlewares.use('/api/inbox/update', async (req, res) => {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      if (!['PATCH', 'POST'].includes(req.method || '')) {
        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, error: 'METHOD_NOT_ALLOWED', reason: 'Method not allowed.' }));
        return;
      }
      if (!authorized(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ ok: false, code: 'UNAUTHORIZED' }));
        return;
      }
      try {
        const payload = await readJson(req);
        const inquiry = mockInquiries.find((item) => item.id === payload.id);
        if (!inquiry) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'NOT_FOUND', reason: 'Nie znaleziono zapytania.' }));
          return;
        }
        inquiry.status = payload.status;
        inquiry.notes = String(payload.notes || '');
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, inquiry }));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'INVALID_JSON', reason: 'Invalid JSON payload.' }));
      }
    });

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
          res.end(JSON.stringify({
            ok: false,
            inquirySaved: false,
            provider: 'none',
            delivered: false,
            error: 'INVALID_JSON',
            reason: 'Invalid JSON payload.',
            inquiryId: null,
            message: 'Invalid JSON payload.',
          }));
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
          res.end(JSON.stringify({
            ok: false,
            inquirySaved: false,
            provider: 'none',
            delivered: false,
            error: 'VALIDATION_ERROR',
            reason: 'Reservation payload validation failed.',
            inquiryId: null,
            errors,
          }));
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
          tours: Array.isArray(payload.tours) ? payload.tours.filter(Boolean).slice(0, 12) : [],
          feedback: payload.feedback && typeof payload.feedback === 'object' ? payload.feedback : null,
          originalMessage: String(payload.message || '').trim(),
        };

        const inquiryId = `LOCAL-${Date.now().toString(36).toUpperCase()}`;
        mockInquiries.unshift({
          id: inquiryId,
          created_at: new Date().toISOString(),
          status: 'new',
          source: 'website',
          stay_type: String(payload.stayType || payload.selectedStayMode || '').trim(),
          language: String(payload.contactLanguage || payload.locale || '').trim(),
          country: String(payload.country || '').trim(),
          full_name: String(payload.fullName || '').trim(),
          email: String(payload.email || '').trim(),
          phone: String(payload.phone || '').trim(),
          arrival_date: String(payload.arrivalIso || '').trim(),
          departure_date: String(payload.departureIso || '').trim(),
          nights: Number(payload.nights || 0),
          services_json: services,
          estimated_total_pln: Number.parseFloat(estimatedTotal) || null,
          estimated_currency_json: payload.calculatorSummary || null,
          vehicle_registration: String(payload.vehiclePlate || '').trim(),
          vehicle_details_json: payload.vehicleDetails || null,
          special_needs: String(payload.specialNeeds || '').trim(),
          trips_interest_json: Array.isArray(payload.tours) ? payload.tours.filter(Boolean).slice(0, 12) : [],
          consents_json: { quiet: Boolean(payload.quietConsent), contact: Boolean(payload.consent), privacy: Boolean(payload.privacyConsent) },
          message: String(payload.message || '').trim(),
          notes: '',
          mail_provider: 'mock',
          mail_delivered: false,
          mail_error: 'Local dev Vite mock - mail body prepared but not sent.',
          raw_payload_json: payload,
        });
        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          inquirySaved: true,
          provider: 'mock',
          delivered: false,
          error: 'MAIL_NOT_DELIVERED',
          reason: 'Local dev Vite mock - mail body prepared but not sent.',
          mode: 'mock',
          inquiryId,
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
  };
};

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.clepardia.com.pl',
  integrations: [
    sitemap({
      filter: (page) => {
        let pathname = page;
        try {
          pathname = new URL(page).pathname;
        } catch {}
        const hiddenRoutes = [
          '/cc-gate-a8f3k9r2p6',
          '/cc-system-qa-preview-a7k9x2',
          '/cc-system-audit-report-a7k9x2',
          '/stay',
        ];
        return !hiddenRoutes.some((route) => pathname.includes(route)) && !/^\/pl(?:\/|$)/.test(pathname);
      },
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
