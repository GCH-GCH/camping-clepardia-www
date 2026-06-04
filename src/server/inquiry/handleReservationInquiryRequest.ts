import { buildAutoresponderMail, buildReceptionMail } from './mailTemplates';
import { sendInquiryWorkflow } from './mailProvider';
import { checkRateLimit } from './rateLimit';
import { getRequestIp } from './security';
import { createCcSystemLeadDraft, normalizeReservationInquiry } from './validation';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const toJsonResponse = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...jsonHeaders,
      ...extraHeaders,
    },
  });

const getNumberEnv = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const safeReadJson = async (request: Request) => {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 32_000) {
    return { ok: false as const, status: 413, message: 'Payload too large.' };
  }

  try {
    return { ok: true as const, payload: await request.json() };
  } catch {
    return { ok: false as const, status: 400, message: 'Invalid JSON payload.' };
  }
};

export const handleReservationInquiryRequest = async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...jsonHeaders,
        allow: 'POST, OPTIONS',
      },
    });
  }

  if (request.method !== 'POST') {
    return toJsonResponse({ ok: false, message: 'Method not allowed.' }, 405, {
      allow: 'POST, OPTIONS',
    });
  }

  const contentType = request.headers.get('content-type') || '';
  if (contentType && !contentType.includes('application/json')) {
    return toJsonResponse({ ok: false, message: 'Content-Type must be application/json.' }, 415);
  }

  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(
    `reservation-inquiry:${ip}`,
    getNumberEnv('RESERVATION_RATE_LIMIT_MAX', 5),
    getNumberEnv('RESERVATION_RATE_LIMIT_WINDOW_MS', 60_000),
  );

  if (!rateLimit.allowed) {
    return toJsonResponse(
      {
        ok: false,
        message: 'Too many requests. Please try again later.',
        resetAt: new Date(rateLimit.resetAt).toISOString(),
      },
      429,
    );
  }

  const readResult = await safeReadJson(request);
  if (!readResult.ok) {
    return toJsonResponse({ ok: false, message: readResult.message }, readResult.status);
  }

  const normalized = normalizeReservationInquiry(readResult.payload);
  if (!normalized.ok) {
    return toJsonResponse({ ok: false, errors: normalized.errors }, 400);
  }

  const inquiry = normalized.inquiry;

  if (inquiry.website) {
    return toJsonResponse({
      ok: true,
      mode: 'spam-filtered',
      inquiryId: inquiry.inquiryId,
    });
  }

  const ccSystemDraft = createCcSystemLeadDraft(inquiry);
  const receptionMail = buildReceptionMail(inquiry);
  const autoresponderMail = inquiry.email ? buildAutoresponderMail(inquiry) : null;
  const mail = await sendInquiryWorkflow(receptionMail, autoresponderMail).catch((error) => ({
    reception: {
      provider: 'mock',
      delivered: false,
      reason: error instanceof Error
        ? `Mail workflow failed: ${error.message}`
        : 'Mail workflow failed before delivery.',
    },
    autoresponder: {
      provider: 'mock',
      delivered: false,
      reason: 'Autoresponder skipped because reception mail workflow failed.',
    },
  }));

  return toJsonResponse({
    ok: true,
    mode: mail.reception.delivered ? 'sent' : 'mock',
    inquiryId: inquiry.inquiryId,
    mail,
    ccSystemDraft,
  });
};
