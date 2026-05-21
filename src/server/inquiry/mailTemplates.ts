import type { MailMessage, NormalizedReservationInquiry } from './types';
import { escapeHtml } from './security';

const env = (key: string, fallback = '') => process.env[key] || fallback;

const line = (label: string, value: unknown) => `${label}: ${value || 'brak'}`;

const peopleSummary = (inquiry: NormalizedReservationInquiry) =>
  [
    line('Dorosli', inquiry.people.adults),
    line('Dzieci 4-14', inquiry.people.children),
    line('Dzieci do 4', inquiry.people.toddlers),
  ].join('\n');

const htmlRow = (label: string, value: unknown) => `
  <tr>
    <td style="padding:10px 12px;color:#5b675f;border-bottom:1px solid #e5eee8;">${escapeHtml(label)}</td>
    <td style="padding:10px 12px;color:#122117;font-weight:700;border-bottom:1px solid #e5eee8;">${escapeHtml(value || 'brak')}</td>
  </tr>
`;

export const buildReceptionMail = (inquiry: NormalizedReservationInquiry): MailMessage => {
  const from = env('MAIL_FROM', 'Camping Clepardia WWW <no-reply@clepardia.com.pl>');
  const to = env('MAIL_TO', 'clepardia@gmail.com');
  const subject = `[WWW] Zapytanie rezerwacyjne - ${inquiry.fullName} - ${inquiry.arrival}`;
  const addons = inquiry.addons.length ? inquiry.addons.join(', ') : 'brak';
  const summerNotice = inquiry.summerNotice ? 'Tak - termin obejmuje sezon letni dla campingu' : 'Nie';
  const calculatorSummary = inquiry.calculatorSummary
    ? JSON.stringify(inquiry.calculatorSummary, null, 2)
    : 'brak podsumowania kalkulatora';

  const text = [
    'Nowe zapytanie rezerwacyjne Camping Clepardia',
    '',
    line('ID', inquiry.inquiryId),
    line('Zrodlo', inquiry.source),
    line('Data wyslania', inquiry.submittedAt),
    '',
    'DANE KLIENTA',
    line('Imie i nazwisko', inquiry.fullName),
    line('Email', inquiry.email),
    line('Telefon', inquiry.phone),
    line('Kraj', inquiry.country),
    line('Jezyk kontaktu', inquiry.contactLanguage),
    '',
    'POBYT',
    line('Termin', `${inquiry.arrival} - ${inquiry.departure}`),
    line('Liczba nocy', inquiry.nights),
    line('Typ pobytu', inquiry.stayType),
    line('Kategoria', inquiry.stayCategory),
    peopleSummary(inquiry),
    line('Dodatki', addons),
    line('Komunikat sezonowy', summerNotice),
    line('Potwierdzenie ciszy nocnej', inquiry.quietConsent ? 'Tak' : 'Nie'),
    '',
    'WIADOMOSC',
    inquiry.message || 'brak',
    '',
    'PODSUMOWANIE KALKULATORA',
    calculatorSummary,
    '',
    'CC SYSTEM DRAFT',
    'Ten mail zawiera strukture gotowa do przyszlego utworzenia leadu/draftu rezerwacji w CC SYSTEM.',
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f5faf6;padding:28px;color:#122117;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #dfece4;border-radius:22px;overflow:hidden;">
        <div style="background:#102319;color:#ffffff;padding:24px 28px;">
          <p style="margin:0 0 8px;color:#8fe0b4;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Camping Clepardia WWW</p>
          <h1 style="margin:0;font-size:26px;line-height:1.15;">Nowe zapytanie rezerwacyjne</h1>
          <p style="margin:12px 0 0;color:#cfe6d8;">${escapeHtml(inquiry.inquiryId)}</p>
        </div>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          ${htmlRow('Imie i nazwisko', inquiry.fullName)}
          ${htmlRow('Email', inquiry.email)}
          ${htmlRow('Telefon', inquiry.phone)}
          ${htmlRow('Kraj', inquiry.country)}
          ${htmlRow('Jezyk kontaktu', inquiry.contactLanguage)}
          ${htmlRow('Termin', `${inquiry.arrival} - ${inquiry.departure}`)}
          ${htmlRow('Liczba nocy', inquiry.nights)}
          ${htmlRow('Typ pobytu', inquiry.stayType)}
          ${htmlRow('Dorosli', inquiry.people.adults)}
          ${htmlRow('Dzieci 4-14', inquiry.people.children)}
          ${htmlRow('Dzieci do 4', inquiry.people.toddlers)}
          ${htmlRow('Dodatki', addons)}
          ${htmlRow('Komunikat sezonowy', summerNotice)}
          ${htmlRow('Potwierdzenie ciszy nocnej', inquiry.quietConsent ? 'Tak' : 'Nie')}
        </table>
        <div style="padding:24px 28px;">
          <h2 style="margin:0 0 10px;font-size:18px;">Wiadomosc klienta</h2>
          <p style="white-space:pre-wrap;line-height:1.65;margin:0;color:#314238;">${escapeHtml(inquiry.message || 'brak')}</p>
        </div>
      </div>
    </div>
  `;

  return { to, from, replyTo: inquiry.email, subject, text, html };
};

export const buildAutoresponderMail = (inquiry: NormalizedReservationInquiry): MailMessage => {
  const from = env('MAIL_FROM', 'Camping Clepardia <no-reply@clepardia.com.pl>');
  const subject = 'Camping Clepardia - otrzymalismy Twoje zapytanie';
  const text = [
    `Dzien dobry ${inquiry.fullName},`,
    '',
    'Dziekujemy za zapytanie do Camping Clepardia.',
    'Recepcja sprawdzi dostepnosc i odpowie mozliwie szybko.',
    '',
    `Termin: ${inquiry.arrival} - ${inquiry.departure}`,
    `Typ pobytu: ${inquiry.stayType}`,
    '',
    'Finalna dostepnosc, cena i szczegoly pobytu sa potwierdzane przez recepcje.',
    '',
    'Camping Clepardia',
    'Henryka Pachonskiego 28A, 31-322 Krakow',
    '+48 795 294 486',
    'clepardia@gmail.com',
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f5faf6;padding:28px;color:#122117;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dfece4;border-radius:22px;padding:28px;">
        <p style="margin:0 0 10px;color:#3CB371;font-weight:800;">Camping Clepardia</p>
        <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;">Dziekujemy za zapytanie</h1>
        <p style="line-height:1.7;">Dzien dobry ${escapeHtml(inquiry.fullName)}, recepcja sprawdzi dostepnosc i odpowie mozliwie szybko.</p>
        <div style="margin:20px 0;padding:18px;border-radius:16px;background:#eef8f1;">
          <strong>Termin:</strong> ${escapeHtml(`${inquiry.arrival} - ${inquiry.departure}`)}<br />
          <strong>Typ pobytu:</strong> ${escapeHtml(inquiry.stayType)}
        </div>
        <p style="line-height:1.7;color:#4b5b51;">Finalna dostepnosc, cena i szczegoly pobytu sa potwierdzane przez recepcje.</p>
      </div>
    </div>
  `;

  return { to: inquiry.email, from, subject, text, html };
};
