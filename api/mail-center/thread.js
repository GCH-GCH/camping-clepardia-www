import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';
import {
  getMailCenterThread,
  sendJson,
} from '../_lib/mailCenter.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) {
      return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    }
    const id = String(req.query?.id || '').trim();
    if (!id) return sendJson(res, 400, { ok: false, code: 'MISSING_ID', error: 'Brak ID wątku.' });
    const result = await getMailCenterThread(id);
    return sendJson(res, 200, { ok: true, ...result });
  } catch (error) {
    logInboxError('mail-center-thread', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, diagnostic.payload);
  }
}
