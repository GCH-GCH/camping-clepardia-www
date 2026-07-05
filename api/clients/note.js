import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';
import {
  readJsonBody,
  sendJson,
} from '../_lib/mailCenter.js';
import {
  buildClientNoteFallback,
} from '../_lib/clients.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('allow', 'POST');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) {
      return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    }

    const payload = await readJsonBody(req);
    return sendJson(res, 200, buildClientNoteFallback(payload));
  } catch (error) {
    logInboxError('clients-note', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, {
      ...diagnostic.payload,
      ok: false,
      saved: false,
    });
  }
}
