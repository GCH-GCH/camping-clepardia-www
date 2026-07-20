import { authorizeInboxRequest, logInboxError, serializeInboxError } from '../../_lib/inbox.js';
import { sendJson } from '../../_lib/mailCenter.js';
import { aggregateEvents, loadAnalyticsEvents, parseAnalyticsFilters } from '../../_lib/analytics.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      return sendJson(res, 405, { ok:false, code:'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) return sendJson(res, 401, { ok:false, code:'UNAUTHORIZED' });
    const events = await loadAnalyticsEvents();
    return sendJson(res, 200, { ok:true, table:'site_events', dashboard:aggregateEvents(events, parseAnalyticsFilters(req.query || {})) });
  } catch (error) {
    logInboxError('analytics-dashboard', error, { method:req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, { ...diagnostic.payload, ok:false });
  }
}
