import { authorizeInboxRequest, inboxError, inboxErrorStatus, listReservationInquiries } from '../_lib/inbox.js';

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.json(payload);
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET');
    return sendJson(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED', reason: 'Method not allowed.' });
  }

  const auth = authorizeInboxRequest(req);
  if (!auth.ok) return sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED', reason: auth.reason });

  try {
    const inquiries = await listReservationInquiries();
    return sendJson(res, 200, { ok: true, inquiries: Array.isArray(inquiries) ? inquiries : [] });
  } catch (error) {
    return sendJson(res, inboxErrorStatus(error), {
      ok: false,
      ...inboxError(error),
    });
  }
}
