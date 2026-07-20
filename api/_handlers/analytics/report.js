import { authorizeInboxRequest, logInboxError, serializeInboxError } from '../../_lib/inbox.js';
import { sendJson } from '../../_lib/mailCenter.js';
import { buildAnalyticsBundle } from '../../_lib/analytics.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      return sendJson(res, 405, { ok:false, code:'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) return sendJson(res, 401, { ok:false, code:'UNAUTHORIZED' });
    const bundle = await buildAnalyticsBundle(req.query || {});
    return sendJson(res, 200, { ok:true, report:bundle.report, range:bundle.dashboard.filters, generatedAt:new Date().toISOString() });
  } catch (error) {
    logInboxError('analytics-report', error, { method:req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, { ...diagnostic.payload, ok:false });
  }
}
