import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';
import {
  MAIL_CENTER_FOLDERS,
  REPLY_TEMPLATE_DEFS,
  listMailCenterThreads,
  mailCenterDiagnostics,
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

    const result = await listMailCenterThreads(req.query || {});
    return sendJson(res, 200, {
      ok: true,
      ...result,
      folders: MAIL_CENTER_FOLDERS,
      templates: REPLY_TEMPLATE_DEFS.map(({ aliases, ...template }) => template),
      diagnostics: mailCenterDiagnostics(),
    });
  } catch (error) {
    logInboxError('mail-center-threads', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, diagnostic.payload);
  }
}
