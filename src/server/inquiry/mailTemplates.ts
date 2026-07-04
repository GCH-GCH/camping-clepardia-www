import type { MailMessage, NormalizedReservationInquiry } from './types';
import { escapeHtml } from './security';
import { calculateBungalowDeposit } from '../../data/pricing';

const env = (key: string, fallback = '') => process.env[key] || fallback;
const firstConfigured = (...values: string[]) => values.find((value) => value.trim()) || '';

const isBungalowInquiry = (inquiry: NormalizedReservationInquiry) =>
  /bungalow|domek|domki|combined|razem/i.test(
    `${inquiry.selectedStayMode} ${inquiry.stayCategory} ${inquiry.stayType}`,
  );

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

const bungalowStaySubtotal = (inquiry: NormalizedReservationInquiry) => {
  const nights = Math.max(1, Number(inquiry.nights) || 1);
  return inquiry.services
    .filter((service) => service.scope === 'bungalow' && /^bungalow-/.test(service.id))
    .reduce((sum, service) => sum + (service.price * service.qty * nights), 0);
};

const bungalowDepositAmount = (inquiry: NormalizedReservationInquiry) =>
  calculateBungalowDeposit(bungalowStaySubtotal(inquiry));

const bungalowDepositLine = (inquiry: NormalizedReservationInquiry) => {
  const amount = bungalowDepositAmount(inquiry);
  return amount > 0 ? `Zaliczka 30%: ${amount} zł` : '';
};

const textValue = (value: unknown) => String(value ?? '').trim();
const hasValue = (value: unknown) => textValue(value).length > 0;
const safeRows = (rows: Array<[string, unknown]>) =>
  rows.filter(([, value]) => hasValue(value) && !/^(-|brak|nie dotyczy)$/i.test(textValue(value)));

const isCampingInquiry = (inquiry: NormalizedReservationInquiry) =>
  /camping|kamper|camper|van|namiot|tent|przyczep|caravan|bus|combined|razem/i.test(
    `${inquiry.selectedStayMode} ${inquiry.stayCategory} ${inquiry.stayType}`,
  );

const arrivalTimeValue = (inquiry: NormalizedReservationInquiry) =>
  textValue(inquiry.arrivalTime).replace(/^unknown$/i, '');

const hasLateArrival = (inquiry: NormalizedReservationInquiry) =>
  /po 21|after 21|nach 21|dopo|après|apres|después|despues|21:|late/i.test(
    `${arrivalTimeValue(inquiry)} ${inquiry.message} ${inquiry.originalMessage}`,
  );

const hasElectricVehicleMention = (inquiry: NormalizedReservationInquiry) =>
  /ev|electric|elektry|ładow|ladow|hybryd|plug-in|tesla/i.test(
    `${inquiry.message} ${inquiry.originalMessage} ${inquiry.vehicleDetails.notes} ${inquiry.vehicleDetails.summary}`,
  );

const guestRows = (inquiry: NormalizedReservationInquiry) => {
  const adults = Number(inquiry.people.adults || 0);
  const children = Number(inquiry.people.children || 0);
  const toddlers = Number(inquiry.people.toddlers || 0);
  const bungalowGuests = Number(inquiry.people.bungalowGuests || 0);
  const campingGuests = Number(inquiry.people.campingGuests || 0);
  const total = adults + children + toddlers + bungalowGuests + campingGuests;
  return safeRows([
    ['Dorośli', adults || ''],
    ['Dzieci 4–14', children || ''],
    ['Dzieci 0–4', toddlers || ''],
    ['Goście w domku', bungalowGuests || ''],
    ['Goście na campingu', campingGuests || ''],
    ['Razem', total || ''],
  ]);
};

const guestsShort = (inquiry: NormalizedReservationInquiry) => {
  const totalRow = guestRows(inquiry).find(([label]) => label === 'Razem');
  return totalRow ? `${totalRow[1]} os.` : 'do potwierdzenia';
};

const selectedServiceLines = (inquiry: NormalizedReservationInquiry) => {
  const merged = new Map<string, { label: string; qty: number; price: number }>();
  inquiry.services.forEach((service) => {
    const key = `${service.scope}:${service.id}:${service.price}`;
    const current = merged.get(key);
    if (current) current.qty += service.qty;
    else merged.set(key, { label: service.label, qty: service.qty, price: service.price });
  });

  const lines = [...merged.values()].map((service) => {
    const nightlyTotal = service.qty * service.price;
    return `${service.label} × ${service.qty} — ${nightlyTotal} PLN / noc`;
  });

  return lines.length ? lines : inquiry.addons.filter(Boolean);
};

const vehicleRows = (inquiry: NormalizedReservationInquiry) => {
  const details = inquiry.vehicleDetails;
  return safeRows([
    [vehiclePlateLabel(inquiry), inquiry.vehiclePlate],
    ['Marka / model', details.model],
    ['Długość', details.length],
    ['Szerokość', details.width],
    ['Wysokość', details.height],
    ['Masa / waga', details.weight],
    ['Ciężki pojazd', details.large ? 'tak' : ''],
    ['Potrzebuje asfaltu', details.asphaltNeeded ? 'tak' : ''],
    ['Uwagi do pojazdu', details.notes || details.summary],
  ]);
};

const importantStayNotes = (inquiry: NormalizedReservationInquiry) => {
  const notes: string[] = [];
  if (inquiry.summerNotice && isCampingInquiry(inquiry)) {
    notes.push('Lipiec/sierpień + camping: miejsca campingowe są według kolejności przyjazdu, bez gwarancji wcześniejszej rezerwacji.');
  }
  if (isBungalowInquiry(inquiry)) {
    notes.push('Domek: check-in od 16:00, check-out do 11:00. Goście zabierają ręczniki, kosmetyki i rzeczy osobiste.');
  }
  if (hasLateArrival(inquiry)) {
    notes.push('Późny przyjazd: przyjazd po 21:00 wymaga wcześniejszego kontaktu z recepcją.');
  }
  if (hasService(inquiry, 'electricity')) {
    notes.push('Prąd 10A: dostępny do wyposażenia kampera/przyczepy, nie służy do ładowania aut elektrycznych.');
  }
  if (hasElectricVehicleMention(inquiry)) {
    notes.push('EV / plug-in: ładowanie samochodów elektrycznych i hybryd plug-in na stanowisku nie jest dostępne.');
  }
  if (hasService(inquiry, 'dog')) {
    notes.push('Pies: opłata 0 PLN, prosimy o opiekę nad psem i sprzątanie.');
  }
  if (hasService(inquiry, 'bus') || inquiry.vehicleDetails.large || inquiry.vehicleDetails.asphaltNeeded) {
    notes.push('Ciężki pojazd: recepcja powinna dobrać odpowiednie, utwardzone miejsce.');
  }
  if (inquiry.arrival || inquiry.departure) {
    notes.push('Dojazd: prosimy korzystać z Google Maps, ponieważ wjazd na camping zmienił się w 2022 roku.');
  }
  return notes;
};

const textSection = (title: string, rowsOrLines: Array<[string, unknown]> | string[]) => {
  if (!rowsOrLines.length) return [];
  const lines = Array.isArray(rowsOrLines[0])
    ? safeRows(rowsOrLines as Array<[string, unknown]>).map(([label, value]) => `${label}: ${value}`)
    : (rowsOrLines as string[]).filter(hasValue).map((value) => `- ${value}`);
  return lines.length ? ['', title, ...lines] : [];
};

const htmlTableCard = (title: string, rows: Array<[string, unknown]>) => {
  const filtered = safeRows(rows);
  if (!filtered.length) return '';
  return `
    <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:20px;background:#ffffff;">
      <h2 style="margin:0 0 12px;font-size:17px;line-height:1.25;color:#102319;">${escapeHtml(title)}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${filtered.map(([label, value]) => `
          <tr>
            <td style="padding:9px 0;color:#62736a;font-size:13px;border-top:1px solid #edf4ef;">${escapeHtml(label)}</td>
            <td style="padding:9px 0;color:#102319;font-size:14px;font-weight:800;text-align:right;border-top:1px solid #edf4ef;">${escapeHtml(value)}</td>
          </tr>
        `).join('')}
      </table>
    </section>
  `;
};

const htmlListCard = (title: string, lines: string[], tone: 'default' | 'important' = 'default') => {
  const filtered = lines.filter(hasValue);
  if (!filtered.length) return '';
  const background = tone === 'important' ? '#fff8ea' : '#ffffff';
  const border = tone === 'important' ? '#f0d7a6' : '#dceee4';
  return `
    <section style="margin:18px 0;padding:18px 20px;border:1px solid ${border};border-radius:20px;background:${background};">
      <h2 style="margin:0 0 12px;font-size:17px;line-height:1.25;color:#102319;">${escapeHtml(title)}</h2>
      <ul style="list-style:none;margin:0;padding:0;">
        ${filtered.map((line) => `
          <li style="margin:0;padding:10px 0;border-top:1px solid rgba(16,35,25,.08);color:#102319;font-weight:750;line-height:1.45;">${escapeHtml(line)}</li>
        `).join('')}
      </ul>
    </section>
  `;
};

const htmlMetric = (icon: string, label: string, value: unknown, hint = '') => hasValue(value) ? `
  <td style="width:50%;padding:7px;">
    <div style="min-height:108px;padding:15px;border:1px solid rgba(220,238,228,.9);border-radius:18px;background:#f8fdf9;">
      <div style="font-size:22px;line-height:1;">${escapeHtml(icon)}</div>
      <div style="margin-top:8px;color:#62736a;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(label)}</div>
      <div style="margin-top:5px;color:#102319;font-size:17px;font-weight:900;line-height:1.2;">${escapeHtml(value)}</div>
      ${hint ? `<div style="margin-top:4px;color:#62736a;font-size:12px;line-height:1.35;">${escapeHtml(hint)}</div>` : ''}
    </div>
  </td>
` : '';

const htmlMetricsGrid = (items: Array<[string, string, unknown, string?]>) => {
  const cells = items.map(([icon, label, value, hint]) => htmlMetric(icon, label, value, hint)).filter(Boolean);
  if (!cells.length) return '';
  const rows: string[] = [];
  for (let index = 0; index < cells.length; index += 2) {
    rows.push(`<tr>${cells[index]}${cells[index + 1] || '<td style="width:50%;padding:7px;"></td>'}</tr>`);
  }
  return `
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:18px 0;">
      ${rows.join('')}
    </table>
  `;
};

export const buildReceptionMail = (inquiry: NormalizedReservationInquiry): MailMessage => {
  const from = firstConfigured(
    env('RESERVATION_FROM_EMAIL'),
    env('MAIL_FROM'),
    'Camping Clepardia WWW <no-reply@clepardia.com.pl>',
  );
  const to = firstConfigured(env('RESERVATION_TO_EMAIL'), env('MAIL_TO'), 'clepardia@gmail.com');
  const subject = `Nowe zapytanie Camping Clepardia — ${inquiry.stayType} — ${inquiry.arrival} - ${inquiry.departure}`;
  const services = selectedServiceLines(inquiry);
  const vehicle = vehicleRows(inquiry);
  const notes = importantStayNotes(inquiry);
  const guests = guestRows(inquiry);
  const contact = [inquiry.email, inquiry.phone].filter(hasValue).join(' · ');
  const dates = [inquiry.arrival, inquiry.departure].filter(hasValue).join(' — ');
  const totalPrice = inquiry.estimatedTotal || inquiry.calculatorSummary?.total || '';
  const depositLine = bungalowDepositLine(inquiry);
  const message = inquiry.originalMessage || inquiry.message || '';
  const subtitle = [inquiry.stayType, dates, [inquiry.fullName, inquiry.country].filter(hasValue).join(' / ')]
    .filter(hasValue)
    .join(' · ');
  const currencyEstimate = inquiry.currencyEstimate || inquiry.calculatorSummary?.currencyEstimate || '';

  const stayRows = safeRows([
    ['Przyjazd', inquiry.arrival],
    ['Wyjazd', inquiry.departure],
    ['Noce', inquiry.nights],
    ['Godzina przyjazdu', arrivalTimeValue(inquiry)],
    ['Typ pobytu', inquiry.stayType],
    ['Cena orientacyjna', totalPrice],
    ...(depositLine ? [['Zaliczka 30%', depositLine.replace(/^Zaliczka 30%:\s*/, '')] as [string, unknown]] : []),
    ['Waluty orientacyjnie', currencyEstimate],
  ]);

  const clientRows = safeRows([
    ['Imię i nazwisko', inquiry.fullName],
    ['Email', inquiry.email],
    ['Telefon', inquiry.phone],
    ['Kraj', inquiry.country],
    ['Język kontaktu', inquiry.contactLanguage],
  ]);

  const text = [
    'Nowe zapytanie Camping Clepardia',
    subtitle,
    ...textSection('DANE KLIENTA', clientRows),
    ...textSection('DANE POBYTU', stayRows),
    ...textSection('GOŚCIE', guests),
    ...textSection('USŁUGI', services),
    ...textSection('POJAZD', vehicle),
    ...textSection('WYCIECZKI', inquiry.tours),
    ...textSection('WYDARZENIE', [inquiry.eventInterest].filter(hasValue)),
    ...textSection('SPECJALNE POTRZEBY', [inquiry.specialNeeds].filter(hasValue)),
    ...textSection('WAŻNE DLA POBYTU', notes),
    ...textSection('WIADOMOŚĆ KLIENTA', [message].filter(hasValue)),
    '',
    'Camping Clepardia',
    'www.clepardia.com.pl',
    '+48 795 294 486',
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#eef7f1;padding:28px;color:#102319;">
      <div style="max-width:760px;margin:0 auto;">
        <header style="padding:28px;border-radius:26px;background:linear-gradient(135deg,#0b1f15 0%,#155f3a 58%,#3CB371 100%);color:#fff;box-shadow:0 24px 70px rgba(16,35,25,.24);">
          <p style="display:inline-block;margin:0 0 13px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.14);color:#dffff0;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;">Nowe zapytanie</p>
          <h1 style="margin:0;font-size:29px;line-height:1.1;">Nowe zapytanie Camping Clepardia</h1>
          <p style="margin:12px 0 0;color:#e5fff0;line-height:1.55;">${escapeHtml(subtitle)}</p>
        </header>

        ${htmlMetricsGrid([
          ['📅', 'Termin', dates, `${inquiry.nights || ''} nocy`],
          ['👥', 'Goście', guestsShort(inquiry)],
          ['🏕️', 'Typ pobytu', inquiry.stayType],
          ['💰', 'Cena orientacyjna', totalPrice],
          ['🌍', 'Kraj / język', [inquiry.country, inquiry.contactLanguage].filter(hasValue).join(' · ')],
          ['📞', 'Kontakt', contact],
        ])}

        ${htmlTableCard('Dane klienta', clientRows)}
        ${htmlTableCard('Dane pobytu', stayRows)}
        ${htmlTableCard('Goście', guests)}
        ${htmlListCard('Usługi', services)}
        ${htmlTableCard('Pojazd', vehicle)}
        ${htmlListCard('Wycieczki', inquiry.tours)}
        ${htmlListCard('Wydarzenie', [inquiry.eventInterest].filter(hasValue))}
        ${htmlListCard('Specjalne potrzeby', [inquiry.specialNeeds].filter(hasValue))}
        ${htmlListCard('Ważne dla pobytu', notes, 'important')}
        ${message ? `
          <section style="margin:18px 0;padding:20px;border:1px solid #dceee4;border-radius:20px;background:#ffffff;">
            <h2 style="margin:0 0 12px;font-size:17px;color:#102319;">Wiadomość klienta</h2>
            <p style="white-space:pre-wrap;line-height:1.65;margin:0;color:#314238;">${escapeHtml(message)}</p>
          </section>
        ` : ''}

        <footer style="padding:20px 6px;color:#54675d;font-size:13px;line-height:1.6;text-align:center;">
          <strong style="display:block;color:#102319;">Camping Clepardia</strong>
          <a href="https://www.clepardia.com.pl" style="color:#2b7a4d;text-decoration:none;">www.clepardia.com.pl</a><br />
          +48 795 294 486
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
  const clientCurrencyEstimate = inquiry.currencyEstimate || inquiry.calculatorSummary?.currencyEstimate || '';
  const clientTotal = inquiry.estimatedTotal || inquiry.calculatorSummary?.total || '';
  const currencyDisclaimer = inquiry.currencyDisclaimer
    || inquiry.calculatorSummary?.currencyDisclaimer
    || 'Przeliczenia walut są orientacyjne. Finalną kwotę i warunki potwierdza recepcja.';
  const subject = 'Otrzymaliśmy Twoje zapytanie - Camping Clepardia';
  const text = [
    `Dzień dobry ${inquiry.fullName},`,
    '',
    'Dziękujemy za zapytanie do Camping Clepardia.',
    'To nie jest automatyczne potwierdzenie rezerwacji. Recepcja sprawdzi dostępność i odpowie możliwie szybko.',
    '',
    `Termin: ${inquiry.arrival} - ${inquiry.departure}`,
    `Typ pobytu: ${inquiry.stayType}`,
    clientTotal ? `Cena orientacyjna: ${clientTotal}` : '',
    clientCurrencyEstimate ? `Waluty orientacyjnie: ${clientCurrencyEstimate}` : '',
    clientCurrencyEstimate ? currencyDisclaimer : '',
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
          ${clientTotal ? `<strong>Cena orientacyjna:</strong> ${escapeHtml(clientTotal)}` : ''}
          ${clientCurrencyEstimate ? `<br /><strong>Waluty orientacyjnie:</strong> ${escapeHtml(clientCurrencyEstimate)}` : ''}
        </div>
        ${clientCurrencyEstimate ? `<p style="line-height:1.7;color:#4b5b51;">${escapeHtml(currencyDisclaimer)}</p>` : ''}
        <p style="line-height:1.7;color:#4b5b51;">To nie jest automatyczne potwierdzenie rezerwacji. Finalną dostępność, cenę i szczegóły pobytu potwierdza recepcja.</p>
        ${bungalowNote ? `<p style="line-height:1.7;color:#4b5b51;">${escapeHtml(bungalowNote)}</p>` : ''}
      </div>
    </div>
  `;

  return { to: inquiry.email, from, subject, text, html };
};
