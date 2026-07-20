import { authorizeInboxRequest, logInboxError, serializeInboxError } from '../../_lib/inbox.js';
import { sendJson } from '../../_lib/mailCenter.js';
import { loadFeedbackIntelligence } from '../../_lib/analytics.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      return sendJson(res, 405, { ok:false, code:'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) return sendJson(res, 401, { ok:false, code:'UNAUTHORIZED' });
    return sendJson(res, 200, { ok:true, feedback:await loadFeedbackIntelligence(req.query || {}) });
  } catch (error) {
    logInboxError('analytics-feedback', error, { method:req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, { ...diagnostic.payload, ok:false });
  }
}
