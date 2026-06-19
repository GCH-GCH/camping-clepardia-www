import type { MailMessage, NormalizedReservationInquiry } from './types';
import { escapeHtml } from './security';

const env = (key: string, fallback = '') => process.env[key] || fallback;
const firstConfigured = (...values: string[]) => values.find((value) => value.trim()) || '';
const yesNo = (value: boolean) => (value ? 'Tak' : 'Nie');
const line = (label: string, value: unknown) => `${label}: ${value || 'brak'}`;

const isBungalowInquiry = (inquiry: NormalizedReservationInquiry) =>
  /bungalow|domek|domki|combined|razem/i.test(
    `${inquiry.selectedStayMode} ${inquiry.stayCategory} ${inquiry.stayType}`,
  );

const servicesSummary = (inquiry: NormalizedReservationInquiry) => {
  if (inquiry.services.length) {
    return inquiry.services.map((service) =>
      `${service.label} x ${service.qty} (${service.price} PLN / noc)`,
    );
  }

  return inquiry.addons.length ? inquiry.addons : ['brak'];
};

const hasService = (inquiry: NormalizedReservationInquiry, id: string) =>
  inquiry.services.some((service) => service.id === id && service.qty > 0);

const vehiclePlateLabel = (inquiry: NormalizedReservationInquiry) => {
  if (hasService(inquiry, 'caravan') || hasService(inquiry, 'cargo-trailer')) return 'Rejestracja przyczepy';
  if (hasService(inquiry, 'camper')) return 'Rejestracja kampera';
  if (hasService(inquiry, 'van')) return 'Rejestracja vana';
  if (hasService(inquiry, 'rooftop-tent') || hasService(inquiry, 'parking')) return 'Rejestracja auta';
  if (hasService(inquiry, 'bus')) return 'Rejestracja busa / ciężarówki / autobusu';
  return 'Numer rejestracyjny';
};

const servicesByScope = (inquiry: NormalizedReservationInquiry, scope: string) =>
  inquiry.services
    .filter((service) => service.scope === scope)
    .map((service) => `${service.label} x ${service.qty} (${service.price} PLN / noc)`);

const vehicleDetailsSummary = (inquiry: NormalizedReservationInquiry) => {
  const details = inquiry.vehicleDetails;
  const rows = [
    line('Marka/model', details.model),
    line('Dlugosc', details.length),
    line('Szerokosc', details.width),
    line('Wysokosc', details.height),
    line('Masa/waga', details.weight),
    line('Duzy/ciezki pojazd', yesNo(details.large)),
    line('Potrzebuje asfaltu', yesNo(details.asphaltNeeded)),
    line('Uwagi do pojazdu', details.notes || details.summary),
  ];
  return rows.filter((row) => !row.endsWith(': brak')).join('\n') || 'brak';
};

const peopleSummary = (inquiry: NormalizedReservationInquiry) => [
  line('Dorośli', inquiry.people.adults),
  line('Dzieci 4-14', inquiry.people.children),
  line('Dzieci do 4', inquiry.people.toddlers),
].join('\n');

const card = (title: string, rows: Array<[string, unknown]>) => `
  <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#ffffff;">
    <h2 style="margin:0 0 14px;font-size:17px;line-height:1.25;color:#102319;">${escapeHtml(title)}</h2>
    <table role="presentation" style="width:100%;border-collapse:collapse;">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:9px 0;color:#62736a;font-size:13px;border-top:1px solid #edf4ef;">${escapeHtml(label)}</td>
          <td style="padding:9px 0;color:#102319;font-size:14px;font-weight:700;text-align:right;border-top:1px solid #edf4ef;">${escapeHtml(value || 'brak')}</td>
        </tr>
      `).join('')}
    </table>
  </section>
`;

export const buildReceptionMail = (inquiry: NormalizedReservationInquiry): MailMessage => {
  const from = firstConfigured(
    env('RESERVATION_FROM_EMAIL'),
    env('MAIL_FROM'),
    'Camping Clepardia WWW <no-reply@clepardia.com.pl>',
  );
  const to = firstConfigured(env('RESERVATION_TO_EMAIL'), env('MAIL_TO'), 'clepardia@gmail.com');
  const subject = `Nowe zapytanie rezerwacyjne — Camping Clepardia — ${inquiry.stayType} — ${inquiry.arrival} - ${inquiry.departure}`;
  const services = servicesSummary(inquiry);
  const bungalowServices = servicesByScope(inquiry, 'bungalow');
  const campingServices = servicesByScope(inquiry, 'camping');
  const isCombined = /combined|razem/i.test(`${inquiry.selectedStayMode} ${inquiry.stayCategory}`);
  const plateLabel = vehiclePlateLabel(inquiry);
  const bungalowNote = isBungalowInquiry(inquiry)
    ? 'W przypadku domków może być wymagana zaliczka. Dane do zaliczki należy wysłać klientowi w odpowiedzi mailowej po potwierdzeniu dostępności.'
    : '';
  const combinedNote = isCombined
    ? 'Zapytanie obejmuje domek i część campingową. Może być wymagana zaliczka za część noclegową.'
    : '';

  const calculatorRows = [
    ['Cena orientacyjna', inquiry.estimatedTotal || inquiry.calculatorSummary?.total || 'brak'],
    ['Waluty orientacyjnie', inquiry.currencyEstimate || inquiry.calculatorSummary?.currencyEstimate || 'brak'],
    ['Cena / noc', inquiry.calculatorSummary?.pricePerNight || 'brak'],
    ['Sezon', inquiry.calculatorSummary?.season || 'brak'],
    ['Status', 'Do potwierdzenia przez recepcję'],
  ] as Array<[string, unknown]>;
  const currencyDisclaimer = inquiry.currencyDisclaimer
    || inquiry.calculatorSummary?.currencyDisclaimer
    || 'Przeliczenia EUR / USD / GBP są orientacyjne i informacyjne. Finalna kwota, forma płatności i ewentualny kurs są potwierdzane przez recepcję.';

  const text = [
    'Nowe zapytanie rezerwacyjne - Camping Clepardia',
    '',
    line('ID', inquiry.inquiryId),
    line('Data wysłania', inquiry.submittedAt),
    line('Status', 'do potwierdzenia przez recepcję'),
    '',
    'DANE KLIENTA',
    line('Imię i nazwisko', inquiry.fullName),
    line('Email', inquiry.email),
    line('Telefon', inquiry.phone),
    line('Kraj', inquiry.country),
    line('Język kontaktu', inquiry.contactLanguage),
    '',
    'POBYT',
    line('Typ pobytu', inquiry.stayType),
    line('Wariant', inquiry.selectedStayMode),
    line('Termin', `${inquiry.arrival} - ${inquiry.departure}`),
    line('Liczba nocy', inquiry.nights),
    line(plateLabel, inquiry.vehiclePlate),
    vehicleDetailsSummary(inquiry),
    peopleSummary(inquiry),
    '',
    'USŁUGI I CENY',
    ...services.map((service) => `- ${service}`),
    ...(isCombined ? [
      '',
      'SEKCJA DOMKI',
      ...(bungalowServices.length ? bungalowServices.map((service) => `- ${service}`) : ['- brak']),
      '',
      'SEKCJA CAMPING',
      ...(campingServices.length ? campingServices.map((service) => `- ${service}`) : ['- brak']),
    ] : []),
    line('Suma orientacyjna', inquiry.estimatedTotal || inquiry.calculatorSummary?.total || 'brak'),
    line('Waluty orientacyjnie', inquiry.currencyEstimate || inquiry.calculatorSummary?.currencyEstimate || 'brak'),
    currencyDisclaimer,
    '',
    'DODATKOWE INFORMACJE',
    line('Specjalne potrzeby', inquiry.specialNeeds),
    line('Późniejszy wyjazd', inquiry.lateCheckout),
    line('Komunikat sezonowy', inquiry.summerNotice ? 'Tak - termin zahacza o lipiec/sierpień' : 'Nie'),
    line('Cisza nocna zaakceptowana', yesNo(inquiry.quietConsent)),
    line('Zgoda kontaktowa', yesNo(inquiry.consent)),
    line('Zgoda RODO / dane osobowe', yesNo(inquiry.privacyConsent)),
    '',
    'WIADOMOŚĆ KLIENTA',
    inquiry.originalMessage || inquiry.message || 'brak',
    '',
    bungalowNote,
    combinedNote,
    '',
    'To zapytanie nie potwierdza automatycznie rezerwacji. Recepcja potwierdza dostępność, cenę i warunki.',
  ].filter(Boolean).join('\n');

  const servicesHtml = services.map((service) => `
    <li style="margin:0;padding:10px 0;border-top:1px solid #edf4ef;color:#102319;font-weight:700;">${escapeHtml(service)}</li>
  `).join('');
  const scopeList = (title: string, lines: string[]) => `
    <div style="margin-top:14px;padding:14px;border-radius:14px;background:#f4fbf6;border:1px solid #dceee4;">
      <strong style="display:block;margin-bottom:8px;color:#102319;">${escapeHtml(title)}</strong>
      <ul style="list-style:none;margin:0;padding:0;">
        ${(lines.length ? lines : ['brak']).map((service) => `
          <li style="margin:0;padding:7px 0;border-top:1px solid #e7f2eb;color:#102319;font-weight:700;">${escapeHtml(service)}</li>
        `).join('')}
      </ul>
    </div>
  `;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#eef7f1;padding:28px;color:#102319;">
      <div style="max-width:760px;margin:0 auto;">
        <header style="padding:26px 28px;border-radius:24px;background:linear-gradient(135deg,#0b1f15,#1b3b2a);color:#fff;box-shadow:0 24px 70px rgba(16,35,25,.22);">
          <p style="display:inline-block;margin:0 0 12px;padding:7px 11px;border-radius:999px;background:rgba(60,179,113,.18);color:#9cf2bf;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;">Nowe zapytanie</p>
          <h1 style="margin:0;font-size:27px;line-height:1.12;">Camping Clepardia</h1>
          <p style="margin:12px 0 0;color:#d7efe0;">${escapeHtml(inquiry.stayType)} · ${escapeHtml(inquiry.arrival)} - ${escapeHtml(inquiry.departure)} · ${escapeHtml(inquiry.inquiryId)}</p>
        </header>

        ${card('Dane klienta', [
          ['Imię i nazwisko', inquiry.fullName],
          ['Email', inquiry.email],
          ['Telefon', inquiry.phone],
          ['Kraj', inquiry.country],
          ['Język kontaktu', inquiry.contactLanguage],
        ])}

        ${card('Pobyt', [
          ['Typ pobytu', inquiry.stayType],
          ['Wariant', inquiry.selectedStayMode],
          ['Termin', `${inquiry.arrival} - ${inquiry.departure}`],
          ['Liczba nocy', inquiry.nights],
          [plateLabel, inquiry.vehiclePlate],
        ])}

        ${card('Dane pojazdu', [
          ['Marka/model', inquiry.vehicleDetails.model],
          ['Dlugosc', inquiry.vehicleDetails.length],
          ['Szerokosc', inquiry.vehicleDetails.width],
          ['Wysokosc', inquiry.vehicleDetails.height],
          ['Masa/waga', inquiry.vehicleDetails.weight],
          ['Duzy/ciezki pojazd', yesNo(inquiry.vehicleDetails.large)],
          ['Potrzebuje asfaltu', yesNo(inquiry.vehicleDetails.asphaltNeeded)],
          ['Uwagi', inquiry.vehicleDetails.notes || inquiry.vehicleDetails.summary],
        ])}

        ${card('Goście i cena', [
          ['Dorośli', inquiry.people.adults],
          ['Dzieci 4-14', inquiry.people.children],
          ['Dzieci do 4', inquiry.people.toddlers],
          ...calculatorRows,
        ])}

        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#ffffff;">
          <h2 style="margin:0 0 10px;font-size:17px;color:#102319;">Usługi</h2>
          <ul style="list-style:none;margin:0;padding:0;">${servicesHtml}</ul>
          ${isCombined ? `${scopeList('Sekcja Domki', bungalowServices)}${scopeList('Sekcja Camping', campingServices)}` : ''}
        </section>

        <section style="margin:18px 0;padding:16px 18px;border-radius:18px;background:#eef8f1;border:1px solid #dceee4;color:#102319;">
          <h2 style="margin:0 0 8px;font-size:16px;">Waluty orientacyjne</h2>
          <p style="margin:0 0 8px;line-height:1.55;font-weight:800;">${escapeHtml(inquiry.currencyEstimate || inquiry.calculatorSummary?.currencyEstimate || 'brak')}</p>
          <p style="margin:0;line-height:1.55;color:#4b5b51;">${escapeHtml(currencyDisclaimer)}</p>
        </section>

        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#ffffff;">
          <h2 style="margin:0 0 10px;font-size:17px;color:#102319;">Wiadomość i uwagi</h2>
          <p style="white-space:pre-wrap;line-height:1.65;margin:0 0 14px;color:#314238;">${escapeHtml(inquiry.originalMessage || inquiry.message || 'brak')}</p>
          <p style="margin:0 0 8px;color:#314238;"><strong>Specjalne potrzeby:</strong> ${escapeHtml(inquiry.specialNeeds || 'brak')}</p>
          <p style="margin:0;color:#314238;"><strong>Późniejszy wyjazd:</strong> ${escapeHtml(inquiry.lateCheckout || 'brak')}</p>
        </section>

        ${(bungalowNote || combinedNote) ? `
          <section style="margin:18px 0;padding:18px 20px;border-radius:18px;background:#fff8ea;border:1px solid #f0d7a6;color:#4c3b13;">
            <h2 style="margin:0 0 10px;font-size:17px;">Zaliczka</h2>
            <p style="margin:0;line-height:1.6;">${escapeHtml(combinedNote || bungalowNote)}</p>
          </section>
        ` : ''}

        <footer style="padding:18px 6px;color:#54675d;font-size:12px;line-height:1.6;">
          Cisza nocna: ${escapeHtml(yesNo(inquiry.quietConsent))}. Zgoda kontaktowa: ${escapeHtml(yesNo(inquiry.consent))}. Zgoda RODO / dane osobowe: ${escapeHtml(yesNo(inquiry.privacyConsent))}. Finalną dostępność i warunki potwierdza recepcja.
        </footer>
      </div>
    </div>
  `;

  return { to, from, replyTo: inquiry.email || undefined, subject, text, html };
};

export const buildAutoresponderMail = (inquiry: NormalizedReservationInquiry): MailMessage => {
  const from = firstConfigured(
    env('RESERVATION_FROM_EMAIL'),
    env('MAIL_FROM'),
    'Camping Clepardia <no-reply@clepardia.com.pl>',
  );
  const bungalowNote = isBungalowInquiry(inquiry)
    ? 'W przypadku domków może być wymagana zaliczka. Szczegóły otrzymasz w odpowiedzi po sprawdzeniu dostępności.'
    : '';
  const subject = 'Otrzymaliśmy Twoje zapytanie - Camping Clepardia';
  const text = [
    `Dzień dobry ${inquiry.fullName},`,
    '',
    'Dziękujemy za zapytanie do Camping Clepardia.',
    'To nie jest automatyczne potwierdzenie rezerwacji. Recepcja sprawdzi dostępność i odpowie możliwie szybko.',
    '',
    `Termin: ${inquiry.arrival} - ${inquiry.departure}`,
    `Typ pobytu: ${inquiry.stayType}`,
    `Cena orientacyjna: ${inquiry.estimatedTotal || inquiry.calculatorSummary?.total || 'do potwierdzenia'}`,
    `Waluty orientacyjnie: ${inquiry.currencyEstimate || inquiry.calculatorSummary?.currencyEstimate || 'brak'}`,
    currencyDisclaimer,
    bungalowNote,
    '',
    'Camping Clepardia',
    'Henryka Pachońskiego 28A, 31-322 Kraków',
    '+48 795 294 486',
    'clepardia@gmail.com',
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#eef7f1;padding:28px;color:#102319;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dceee4;border-radius:22px;padding:28px;">
        <p style="margin:0 0 10px;color:#3CB371;font-weight:900;letter-spacing:.04em;text-transform:uppercase;">Camping Clepardia</p>
        <h1 style="margin:0 0 14px;font-size:26px;line-height:1.15;">Otrzymaliśmy Twoje zapytanie</h1>
        <p style="line-height:1.7;">Dzień dobry ${escapeHtml(inquiry.fullName)}, recepcja sprawdzi dostępność i odpowie możliwie szybko.</p>
        <div style="margin:20px 0;padding:18px;border-radius:16px;background:#eef8f1;border:1px solid #dceee4;">
          <strong>Termin:</strong> ${escapeHtml(`${inquiry.arrival} - ${inquiry.departure}`)}<br />
          <strong>Typ pobytu:</strong> ${escapeHtml(inquiry.stayType)}<br />
          <strong>Cena orientacyjna:</strong> ${escapeHtml(inquiry.estimatedTotal || inquiry.calculatorSummary?.total || 'do potwierdzenia')}
          <br /><strong>Waluty orientacyjnie:</strong> ${escapeHtml(inquiry.currencyEstimate || inquiry.calculatorSummary?.currencyEstimate || 'brak')}
        </div>
        <p style="line-height:1.7;color:#4b5b51;">${escapeHtml(currencyDisclaimer)}</p>
        <p style="line-height:1.7;color:#4b5b51;">To nie jest automatyczne potwierdzenie rezerwacji. Finalną dostępność, cenę i szczegóły pobytu potwierdza recepcja.</p>
        ${bungalowNote ? `<p style="line-height:1.7;color:#4b5b51;">${escapeHtml(bungalowNote)}</p>` : ''}
      </div>
    </div>
  `;

  return { to: inquiry.email, from, subject, text, html };
};
