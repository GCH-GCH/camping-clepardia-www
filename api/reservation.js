const DAY = 24 * 60 * 60 * 1000;
const MAX_BODY = 32_000;

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.json(payload);
};

const oneLine = (value, max = 600) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const longText = (value, max = 2400) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const configured = (...values) => values.find((value) => String(value || '').trim()) || '';

const mailEnvSnapshot = () => {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const from = configured(process.env.RESERVATION_FROM_EMAIL, process.env.MAIL_FROM, 'Camping Clepardia WWW <no-reply@clepardia.com.pl>');
  const to = configured(process.env.RESERVATION_TO_EMAIL, process.env.MAIL_TO, 'clepardia@gmail.com');
  const fromDomain = String(from).match(/@([^>\s]+)/)?.[1] || '';

  return {
    resendKeyPresent: Boolean(apiKey),
    resendKeyPrefix: apiKey ? apiKey.slice(0, 3) : '',
    reservationFromPresent: Boolean(String(process.env.RESERVATION_FROM_EMAIL || '').trim()),
    reservationToPresent: Boolean(String(process.env.RESERVATION_TO_EMAIL || '').trim()),
    fromDomain,
    toPresent: Boolean(to),
  };
};

const logMailEnv = (inquiryId) => {
  try {
    console.info('[reservation-api] mail-env', { inquiryId, ...mailEnvSnapshot() });
  } catch {
    // Logging must never block accepting an enquiry.
  }
};

const collectBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;

    req.on('data', (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      length += buffer.length;
      if (length > MAX_BODY) {
        reject(new Error('Payload too large.'));
        return;
      }
      chunks.push(buffer);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const readPayload = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = typeof req.body === 'string' ? req.body : await collectBody(req);
  return raw ? JSON.parse(raw) : {};
};

const parseDate = (value) => {
  const raw = oneLine(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
};

const displayDate = (date) => {
  if (!date) return '';
  return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`;
};

const normalizeServices = (payload) => {
  const services = Array.isArray(payload.services) ? payload.services : [];
  const addons = Array.isArray(payload.addons) ? payload.addons : [];

  return services
    .map((service) => ({
      id: oneLine(service?.id, 80),
      scope: oneLine(service?.scope, 40),
      label: oneLine(service?.label, 120),
      qty: Math.max(0, Math.floor(Number(service?.qty || 0))),
      price: Math.max(0, Number(service?.price || 0)),
    }))
    .filter((service) => service.id && service.label && service.qty > 0)
    .concat(
      addons
        .filter(Boolean)
        .slice(0, 12)
        .map((addon, index) => ({
          id: `addon-${index + 1}`,
          scope: 'legacy',
          label: oneLine(addon, 120),
          qty: 1,
          price: 0,
        })),
    )
    .slice(0, 40);
};

const validate = (payload) => {
  const errors = {};
  const arrival = parseDate(payload.arrivalIso || payload.arrival);
  const departure = parseDate(payload.departureIso || payload.departure);
  const services = normalizeServices(payload);
  const email = oneLine(payload.email, 254).toLowerCase();
  const phone = oneLine(payload.phone, 80);

  if (!oneLine(payload.fullName, 140)) errors.fullName = 'Podaj imie i nazwisko.';
  if (!email && !phone) errors.contact = 'Podaj adres email albo telefon.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Podaj poprawny adres email.';
  if (!oneLine(payload.country, 120)) errors.country = 'Wybierz kraj.';
  if (!arrival) errors.arrival = 'Podaj date przyjazdu.';
  if (!departure) errors.departure = 'Podaj date wyjazdu.';
  if (arrival && departure && departure <= arrival) errors.departure = 'Data wyjazdu musi byc po dacie przyjazdu.';
  if (!oneLine(payload.stayType || payload.selectedStayMode, 140)) errors.stayType = 'Wybierz typ pobytu.';
  if (!services.length) errors.services = 'Wybierz przynajmniej jedna opcje pobytu lub usluge.';
  if (!payload.quietConsent) errors.quietConsent = 'Potwierdz zasady ciszy nocnej.';
  if (!payload.consent) errors.consent = 'Zaakceptuj kontakt zwrotny.';
  if (!payload.privacyConsent) errors.privacyConsent = 'Zaakceptuj zgode na przetwarzanie danych.';

  return { errors, arrival, departure, services, email, phone };
};

const createInquiry = (payload, normalized) => {
  const nights = normalized.arrival && normalized.departure
    ? Math.max(1, Math.round((normalized.departure.getTime() - normalized.arrival.getTime()) / DAY))
    : Math.max(0, Number(payload.nights || 0));

  return {
    inquiryId: `WEB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    fullName: oneLine(payload.fullName, 140),
    email: normalized.email,
    phone: normalized.phone,
    country: oneLine(payload.country, 120),
    contactLanguage: oneLine(payload.contactLanguage || payload.locale || 'PL', 40),
    stayType: oneLine(payload.stayType || payload.selectedStayMode, 140),
    stayTypeId: oneLine(payload.stayTypeId, 80),
    stayCategory: oneLine(payload.stayCategory, 40),
    selectedStayMode: oneLine(payload.selectedStayMode || payload.stayMode || payload.stayCategory, 40),
    arrivalIso: oneLine(payload.arrivalIso, 20),
    departureIso: oneLine(payload.departureIso, 20),
    arrival: displayDate(normalized.arrival),
    departure: displayDate(normalized.departure),
    nights,
    people: {
      adults: Math.max(0, Math.floor(Number(payload.people?.adults || 0))),
      children: Math.max(0, Math.floor(Number(payload.people?.children || 0))),
      toddlers: Math.max(0, Math.floor(Number(payload.people?.toddlers || 0))),
    },
    services: normalized.services,
    estimatedTotal: oneLine(payload.estimatedTotal || payload.calculatorSummary?.total, 80),
    calculatorSummary: payload.calculatorSummary || null,
    vehiclePlate: oneLine(payload.vehiclePlate, 80),
    specialNeeds: longText(payload.specialNeeds, 1200),
    lateCheckout: oneLine(payload.lateCheckout, 160),
    message: longText(payload.message || payload.originalMessage, 2400),
    quietConsent: Boolean(payload.quietConsent),
    consent: Boolean(payload.consent),
    privacyConsent: Boolean(payload.privacyConsent),
    website: oneLine(payload.website, 220),
    summerNotice: Boolean(payload.summerNotice),
  };
};

const hasBungalow = (inquiry) =>
  /bungalow|domek|domki|combined|razem/i.test(`${inquiry.selectedStayMode} ${inquiry.stayCategory} ${inquiry.stayType}`);

const createCcSystemDraft = (inquiry) => ({
  source: 'website',
  status: 'new',
  type: 'reservation_inquiry',
  customer: {
    fullName: inquiry.fullName,
    email: inquiry.email,
    phone: inquiry.phone,
    country: inquiry.country,
    language: inquiry.contactLanguage,
  },
  stay: {
    arrivalIso: inquiry.arrivalIso,
    departureIso: inquiry.departureIso,
    nights: inquiry.nights,
    stayTypeId: inquiry.stayTypeId,
    stayType: inquiry.stayType,
    stayCategory: inquiry.stayCategory,
    people: inquiry.people,
    services: inquiry.services,
    estimatedTotal: inquiry.estimatedTotal,
    vehiclePlate: inquiry.vehiclePlate,
    specialNeeds: inquiry.specialNeeds,
    lateCheckout: inquiry.lateCheckout,
    summerNotice: inquiry.summerNotice,
    quietConsent: inquiry.quietConsent,
    consent: inquiry.consent,
    privacyConsent: inquiry.privacyConsent,
  },
  notes: inquiry.message,
  createdAt: inquiry.submittedAt,
});

const buildReceptionMail = (inquiry) => {
  const depositNote = hasBungalow(inquiry)
    ? 'W przypadku domkow moze byc wymagana zaliczka. Dane do zaliczki nalezy wyslac klientowi w odpowiedzi mailowej po potwierdzeniu dostepnosci.'
    : '';
  const services = inquiry.services.map((service) => `${service.label} x ${service.qty} (${service.price} PLN / noc)`);
  const rows = [
    ['ID', inquiry.inquiryId],
    ['Typ pobytu', inquiry.stayType],
    ['Termin', `${inquiry.arrival} - ${inquiry.departure}`],
    ['Noce', inquiry.nights],
    ['Cena orientacyjna', inquiry.estimatedTotal || 'brak'],
    ['Imie i nazwisko', inquiry.fullName],
    ['Email', inquiry.email],
    ['Telefon', inquiry.phone],
    ['Kraj', inquiry.country],
    ['Jezyk kontaktu', inquiry.contactLanguage],
    ['Numer rejestracyjny', inquiry.vehiclePlate || 'brak'],
    ['Specjalne potrzeby', inquiry.specialNeeds || 'brak'],
    ['Pozniejszy wyjazd', inquiry.lateCheckout || 'brak'],
    ['Cisza nocna', inquiry.quietConsent ? 'zaakceptowana' : 'brak'],
    ['Zgoda kontaktowa', inquiry.consent ? 'zaakceptowana' : 'brak'],
    ['Zgoda RODO', inquiry.privacyConsent ? 'zaakceptowana' : 'brak'],
  ];
  const rowHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:9px 0;color:#61736a;border-top:1px solid #e6f1ea;">${escapeHtml(label)}</td>
      <td style="padding:9px 0;color:#102319;font-weight:800;text-align:right;border-top:1px solid #e6f1ea;">${escapeHtml(value || 'brak')}</td>
    </tr>
  `).join('');
  const serviceHtml = services.map((service) => `
    <li style="padding:9px 0;border-top:1px solid #e6f1ea;color:#102319;font-weight:800;">${escapeHtml(service)}</li>
  `).join('');
  const bodyHtml = `
    <div style="font-family:Arial,sans-serif;background:#eef7f1;padding:28px;color:#102319;">
      <div style="max-width:760px;margin:0 auto;">
        <header style="padding:26px 28px;border-radius:24px;background:linear-gradient(135deg,#0b1f15,#1b3b2a);color:#fff;">
          <p style="display:inline-block;margin:0 0 12px;padding:7px 11px;border-radius:999px;background:rgba(60,179,113,.18);color:#9cf2bf;font-size:12px;font-weight:900;text-transform:uppercase;">Nowe zapytanie</p>
          <h1 style="margin:0;font-size:27px;">Camping Clepardia</h1>
          <p style="margin:12px 0 0;color:#d7efe0;">${escapeHtml(inquiry.stayType)} - ${escapeHtml(inquiry.arrival)} - ${escapeHtml(inquiry.departure)} - ${escapeHtml(inquiry.inquiryId)}</p>
        </header>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Dane zapytania</h2>
          <table role="presentation" style="width:100%;border-collapse:collapse;">${rowHtml}</table>
        </section>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Uslugi i ceny</h2>
          <ul style="list-style:none;margin:0;padding:0;">${serviceHtml}</ul>
        </section>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Wiadomosc klienta</h2>
          <p style="white-space:pre-wrap;line-height:1.65;margin:0;">${escapeHtml(inquiry.message || 'brak')}</p>
        </section>
        ${depositNote ? `<section style="margin:18px 0;padding:18px 20px;border-radius:18px;background:#fff8ea;border:1px solid #f0d7a6;color:#4c3b13;"><strong>Zaliczka</strong><p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(depositNote)}</p></section>` : ''}
        <footer style="padding:18px 6px;color:#54675d;font-size:12px;line-height:1.6;">Status: do potwierdzenia przez recepcje. To zapytanie nie potwierdza automatycznie rezerwacji.</footer>
      </div>
    </div>
  `;
  const bodyText = [
    'Nowe zapytanie rezerwacyjne - Camping Clepardia',
    '',
    ...rows.map(([label, value]) => `${label}: ${value || 'brak'}`),
    '',
    'USLUGI I CENY',
    ...(services.length ? services.map((service) => `- ${service}`) : ['- brak']),
    '',
    'WIADOMOSC KLIENTA',
    inquiry.message || 'brak',
    '',
    depositNote,
    'Status: do potwierdzenia przez recepcje. To zapytanie nie potwierdza automatycznie rezerwacji.',
  ].filter(Boolean).join('\n');

  return {
    from: configured(process.env.RESERVATION_FROM_EMAIL, process.env.MAIL_FROM, 'Camping Clepardia WWW <no-reply@clepardia.com.pl>'),
    to: configured(process.env.RESERVATION_TO_EMAIL, process.env.MAIL_TO, 'clepardia@gmail.com'),
    replyTo: inquiry.email || undefined,
    subject: `Nowe zapytanie rezerwacyjne - Camping Clepardia - ${inquiry.stayType} - ${inquiry.arrival} - ${inquiry.departure}`,
    html: bodyHtml,
    text: bodyText,
  };
};

const sendMail = async (message) => {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return {
      provider: 'mock',
      delivered: false,
      reason: 'RESEND_API_KEY is not configured - mail body prepared but not sent.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to.split(',').map((item) => item.trim()).filter(Boolean),
        reply_to: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorCode = oneLine(body?.name || body?.code || body?.error || `RESEND_${response.status}`, 120);
      const message = oneLine(body?.message || body?.error || `Resend returned ${response.status}.`, 800);
      return {
        provider: 'resend',
        delivered: false,
        status: response.status,
        errorCode,
        message,
        reason: message,
      };
    }

    return {
      provider: 'resend',
      delivered: true,
      messageId: body?.id || '',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resend request failed.';
    return {
      provider: 'resend',
      delivered: false,
      errorCode: 'RESEND_REQUEST_FAILED',
      message,
      reason: message,
    };
  }
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('allow', 'POST, OPTIONS');
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST, OPTIONS');
    return sendJson(res, 405, { ok: false, message: 'Method not allowed.' });
  }

  try {
    const payload = await readPayload(req);
    const normalized = validate(payload);

    if (Object.keys(normalized.errors).length) {
      return sendJson(res, 400, { ok: false, errors: normalized.errors });
    }

    const inquiry = createInquiry(payload, normalized);
    if (inquiry.website) {
      return sendJson(res, 200, { ok: true, mode: 'spam-filtered', inquiryId: inquiry.inquiryId });
    }

    logMailEnv(inquiry.inquiryId);
    const reception = await sendMail(buildReceptionMail(inquiry));
    const mail = {
      reception,
      autoresponder: {
        provider: reception.provider,
        delivered: false,
        reason: 'Customer autoresponder template is prepared for a later step.',
      },
    };

    if (reception.provider === 'resend' && !reception.delivered) {
      console.error('[reservation-api] resend-error', {
        inquiryId: inquiry.inquiryId,
        status: reception.status || null,
        errorCode: reception.errorCode || 'RESEND_ERROR',
        message: reception.message || reception.reason || 'Resend delivery failed.',
      });
      return sendJson(res, 502, {
        ok: false,
        mode: 'resend-error',
        errorCode: reception.errorCode || 'RESEND_ERROR',
        message: reception.message || reception.reason || 'Resend delivery failed.',
        inquiryId: inquiry.inquiryId,
        mail,
        ccSystemDraft: createCcSystemDraft(inquiry),
      });
    }

    return sendJson(res, 200, {
      ok: true,
      mode: reception.delivered ? 'sent' : 'mock',
      inquiryId: inquiry.inquiryId,
      mail,
      ccSystemDraft: createCcSystemDraft(inquiry),
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      mode: 'error',
      message: 'Reservation endpoint failed before accepting the enquiry.',
      reason: error instanceof Error ? error.message : 'Unknown reservation endpoint error.',
    });
  }
}
