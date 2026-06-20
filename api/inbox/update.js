import { authorizeInboxRequest, inboxError, updateReservationInquiry } from '../_lib/inbox.js';

const ALLOWED_STATUSES = new Set(['new', 'needs_reply', 'replied', 'confirmed', 'rejected', 'spam', 'archived']);

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.json(payload);
};

export default async function handler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    res.setHeader('allow', 'PATCH, POST');
    return sendJson(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED', reason: 'Method not allowed.' });
  }

  const auth = authorizeInboxRequest(req);
  if (!auth.ok) return sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED', reason: auth.reason });

  const id = String(req.body?.id || '').trim();
  const status = String(req.body?.status || '').trim();
  const notes = String(req.body?.notes ?? '').trim().slice(0, 5000);
  if (!id) return sendJson(res, 400, { ok: false, error: 'MISSING_ID', reason: 'Brak ID zapytania.' });
  if (!ALLOWED_STATUSES.has(status)) {
    return sendJson(res, 400, { ok: false, error: 'INVALID_STATUS', reason: 'Nieprawidłowy status.' });
  }

  try {
    const inquiry = await updateReservationInquiry(id, { status, notes });
    if (!inquiry) return sendJson(res, 404, { ok: false, error: 'NOT_FOUND', reason: 'Nie znaleziono zapytania.' });
    return sendJson(res, 200, { ok: true, inquiry });
  } catch (error) {
    return sendJson(res, error?.code === 'SUPABASE_NOT_CONFIGURED' ? 503 : 502, {
      ok: false,
      ...inboxError(error),
    });
  }
}

