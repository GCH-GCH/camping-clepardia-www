import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
  updateReservationInquiry,
} from '../_lib/inbox.js';

const ALLOWED_STATUSES = new Set(['new', 'needs_reply', 'replied', 'confirmed', 'rejected', 'spam', 'archived']);

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.json(payload);
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'PATCH' && req.method !== 'POST') {
      res.setHeader('allow', 'PATCH, POST');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });

    const id = String(req.body?.id || '').trim();
    const status = String(req.body?.status || '').trim();
    const notes = String(req.body?.notes ?? '').trim().slice(0, 5000);
    if (!id) return sendJson(res, 400, { ok: false, code: 'MISSING_ID', error: 'Brak ID zapytania.' });
    if (!ALLOWED_STATUSES.has(status)) {
      return sendJson(res, 400, { ok: false, code: 'INVALID_STATUS', error: 'Nieprawidłowy status.' });
    }

    const inquiry = await updateReservationInquiry(id, { status, notes });
    if (!inquiry) return sendJson(res, 404, { ok: false, code: 'NOT_FOUND', error: 'Nie znaleziono zapytania.' });
    return sendJson(res, 200, { ok: true, inquiry });
  } catch (error) {
    logInboxError('inbox-update', error);
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, diagnostic.payload);
  }
}
