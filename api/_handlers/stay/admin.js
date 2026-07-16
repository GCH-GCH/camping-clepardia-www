import { authorizeInboxRequest, logInboxError, serializeInboxError } from '../../_lib/inbox.js';
import { readJsonBody, sendJson } from '../../_lib/mailCenter.js';
import { createStayPanelForInquiry, regenerateStayPanelForInquiry } from '../../_lib/stay.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('allow', 'POST');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    const body = await readJsonBody(req);
    if (!['create', 'regenerate'].includes(body.action)) {
      return sendJson(res, 400, { ok: false, code: 'STAY_ACTION_INVALID', error: 'Nieprawidłowa akcja My Stay.' });
    }
    const myStay = body.action === 'create'
      ? await createStayPanelForInquiry(body.inquiryId, body.locale)
      : await regenerateStayPanelForInquiry(body.inquiryId);
    return sendJson(res, 200, { ok: true, myStay });
  } catch (error) {
    logInboxError('stay-admin', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, diagnostic.payload);
  }
}
