import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
} from '../../_lib/inbox.js';
import {
  sendJson,
} from '../../_lib/mailCenter.js';
import {
  getSiteEventsStatus,
} from '../../_lib/camp.js';

const isAnalyticsMigrationError = (payload = {}) => {
  const text = `${payload.error || ''} ${payload.details || ''}`.toLowerCase();
  return payload.code === 'SUPABASE_QUERY_FAILED'
    && (/site_events/.test(text) || /relation .*does not exist/.test(text) || /schema cache/.test(text));
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) {
      return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    }

    const status = await getSiteEventsStatus();
    return sendJson(res, 200, {
      ok: true,
      migrationRequired: false,
      ...status,
    });
  } catch (error) {
    logInboxError('analytics-status', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    const migrationRequired = isAnalyticsMigrationError(diagnostic.payload);
    return sendJson(res, diagnostic.status, {
      ...diagnostic.payload,
      ok: false,
      table: 'site_events',
      migrationRequired,
      eventCount: 0,
      recentEvents: [],
      reason: migrationRequired
        ? 'Migracja site_events nie została jeszcze uruchomiona w Supabase.'
        : diagnostic.payload.error,
    });
  }
}
