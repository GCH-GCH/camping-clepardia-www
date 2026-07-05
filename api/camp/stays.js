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
  listCampStays,
  saveCampStay,
} from '../_lib/camp.js';

const isCampMigrationError = (payload = {}) => {
  const text = `${payload.error || ''} ${payload.details || ''}`.toLowerCase();
  return payload.code === 'SUPABASE_QUERY_FAILED'
    && (/camp_stays/.test(text) || /relation .*does not exist/.test(text) || /schema cache/.test(text));
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('allow', 'GET, POST');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) {
      return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    }

    if (req.method === 'GET') {
      const stays = await listCampStays();
      return sendJson(res, 200, {
        ok: true,
        table: 'camp_stays',
        migrationRequired: false,
        stays,
      });
    }

    const stay = await saveCampStay(await readJsonBody(req));
    return sendJson(res, 200, {
      ok: true,
      table: 'camp_stays',
      saved: true,
      stay,
      stayId: stay.id,
      caseNumber: stay.case_number,
    });
  } catch (error) {
    logInboxError('camp-stays', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    const migrationRequired = isCampMigrationError(diagnostic.payload);
    const migrationMessage = 'CAMP wymaga uruchomienia migracji Supabase przed zapisem pobytów.';
    return sendJson(res, diagnostic.status, {
      ...diagnostic.payload,
      ok: false,
      saved: false,
      table: 'camp_stays',
      migrationRequired,
      reason: migrationRequired ? migrationMessage : diagnostic.payload.error,
      error: migrationRequired ? migrationMessage : diagnostic.payload.error,
    });
  }
}
