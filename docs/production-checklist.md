# Camping Clepardia WWW - production checklist

## Deploy

- [ ] Wybrac finalny hosting: Vercel albo Netlify.
- [ ] Ustawic `PUBLIC_SITE_URL` na finalna domene.
- [ ] Podmienic `site` w `astro.config.mjs` z placeholdera `https://twojadomena.pl`.
- [ ] Sprawdzic build produkcyjny: `npm run build`.
- [ ] Sprawdzic preview produkcyjny: `npm run preview`.

## Domena i SSL

- [ ] Podpiac finalna domene.
- [ ] Wlaczyc SSL.
- [ ] Wymusic HTTPS.
- [ ] Sprawdzic canonical i hreflang po finalnej domenie.

## Formularz i maile

- [ ] Wybrac mail provider: Resend, Postmark, SendGrid, SMTP lub inny.
- [ ] Ustawic `MAIL_PROVIDER`.
- [ ] Ustawic `MAIL_FROM`.
- [ ] Ustawic `MAIL_TO`.
- [ ] Przetestowac mail do recepcji.
- [ ] Przetestowac autoresponder do klienta.
- [ ] Sprawdzic reply-to na adres klienta.
- [ ] Przetestowac walidacje backendu.
- [ ] Przetestowac honeypot.
- [ ] Ustawic docelowy rate limit w hostingu albo warstwie edge/WAF.

## CC SYSTEM

- [ ] Ustalic finalny endpoint lub kolejke dla leadow z WWW.
- [ ] Ustawic `CC_SYSTEM_WEBHOOK_URL`.
- [ ] Ustawic `CC_SYSTEM_WEBHOOK_SECRET`.
- [ ] Mapowac `ccSystemDraft` na lead.
- [ ] Mapowac `ccSystemDraft.stay` na draft rezerwacji.
- [ ] Przypisywac source: `website`.
- [ ] Przypisywac jezyk klienta.
- [ ] Dodac status leadu: `new`.

## SEO

- [ ] Finalne title i meta description dla wszystkich podstron.
- [ ] Finalna domena w canonical.
- [ ] Hreflang bez `hu`.
- [ ] Sitemap po finalnej domenie.
- [ ] `robots.txt` z finalnym URL sitemap.
- [ ] FAQ schema tylko na `/faq`.
- [ ] Structured data z finalnym URL i geo.

## Social sharing

- [ ] Dodac `public/seo/og/og-home-pl.jpg` 1200x630.
- [ ] Dodac `public/seo/og/og-home-en.jpg` 1200x630.
- [ ] Przetestowac OpenGraph dla strony glownej i podstron.
- [ ] Przetestowac Twitter/X card.

## Assety

- [ ] Wrzucic finalne hero desktop WebP 2560x1440.
- [ ] Wrzucic finalne hero mobile WebP 1200x1600.
- [ ] Wrzucic zdjecia campingu.
- [ ] Wrzucic zdjecia domkow.
- [ ] Wrzucic zdjecia sanitariatow.
- [ ] Wrzucic zdjecia dojazdu.
- [ ] Wrzucic zdjecia atrakcji.
- [ ] Wrzucic pelna galerie.
- [ ] Sprawdzic brak broken image.
- [ ] Sprawdzic alt texty po finalnych zdjeciach.

## Favicon i PWA

- [ ] Finalny `favicon.ico`.
- [ ] Finalny `favicon.svg`.
- [ ] `apple-touch-icon.png` 180x180.
- [ ] PWA icons 192x192 i 512x512.
- [ ] Finalny `manifest.webmanifest`.

## Mobile UX

- [ ] Test 360 px.
- [ ] Test 390 px.
- [ ] Test 768 px.
- [ ] Test iOS Safari.
- [ ] Test Android Chrome.
- [ ] Sprawdzic navbar mobile.
- [ ] Sprawdzic formularz kontaktowy.
- [ ] Sprawdzic kalkulator.
- [ ] Sprawdzic chat bottom sheet.
- [ ] Sprawdzic scroll-to-top.

## Performance

- [ ] Lighthouse mobile.
- [ ] Lighthouse desktop.
- [ ] WebP dla zdjec.
- [ ] Lazy loading sekcji.
- [ ] Preload tylko kluczowych assetow.
- [ ] Brak ciezkich animacji na mobile.

## Accessibility

- [ ] Focus states.
- [ ] Kontrast w dark mode.
- [ ] Kontrast w light mode.
- [ ] Klawiatura: navbar, dropdown jezykow, formularz, FAQ, galeria.
- [ ] Etykiety formularza.
- [ ] `aria-live` dla komunikatow formularza.

## Analytics i monitoring

- [ ] Analytics bez naruszania prywatnosci.
- [ ] Consent/cookie workflow, jesli wymagany.
- [ ] Monitoring bledow JS.
- [ ] Monitoring endpointu formularza.
- [ ] Alert, jesli mail workflow zwraca blad.

## Backup i utrzymanie

- [ ] Backup repo.
- [ ] Backup finalnych assetow zrodlowych.
- [ ] Instrukcja aktualizacji cen.
- [ ] Instrukcja aktualizacji zdjec.
- [ ] Instrukcja aktualizacji tlumaczen.
