import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';
import {
  readJsonBody,
  sendJson,
  updateMailCenterStatus,
} from '../_lib/mailCenter.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'PATCH') {
      res.setHeader('allow', 'POST, PATCH');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) {
      return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    }
    const result = await updateMailCenterStatus(await readJsonBody(req));
    return sendJson(res, 200, result);
  } catch (error) {
    logInboxError('mail-center-status', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, diagnostic.payload);
  }
}
