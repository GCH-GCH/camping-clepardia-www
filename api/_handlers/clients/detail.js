import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
} from '../../_lib/inbox.js';
import {
  sendJson,
} from '../../_lib/mailCenter.js';
import {
  clientsMigrationMessage,
  getClientOnlineDetail,
  isCampStaysMigrationError,
} from '../../_lib/clients.js';

const queryFromRequest = (req) => new URL(req.url || '/', 'http://localhost');

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) {
      return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    }

    const url = queryFromRequest(req);
    const client = await getClientOnlineDetail({
      clientKey: url.searchParams.get('clientKey') || '',
      stayId: url.searchParams.get('stayId') || '',
      limit: url.searchParams.get('limit') || 1000,
    });

    return sendJson(res, 200, {
      ok: true,
      source: 'camp_stays',
      migrationRequired: false,
      client,
    });
  } catch (error) {
    logInboxError('clients-detail', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    const migrationRequired = isCampStaysMigrationError(diagnostic.payload);
    return sendJson(res, diagnostic.status, {
      ...diagnostic.payload,
      ok: false,
      source: 'camp_stays',
      migrationRequired,
      client: null,
      reason: migrationRequired ? clientsMigrationMessage : diagnostic.payload.error,
      migrationFile: migrationRequired ? 'supabase/migrations/20260705121500_camp_stays_and_site_events.sql' : undefined,
    });
  }
}
