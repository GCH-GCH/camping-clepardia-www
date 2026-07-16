import {
  authorizeInboxRequest,
  listReservationInquiries,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';
import { listStayPanelsForInquiries } from '../_lib/stay.js';

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.json(payload);
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
    const inquiries = await listReservationInquiries();
    let myStayAvailable = true;
    try {
      const panels = await listStayPanelsForInquiries(inquiries.map((item) => item.id));
      inquiries.forEach((item) => {
        item.my_stay = panels.get(String(item.id)) || null;
      });
    } catch (error) {
      myStayAvailable = false;
      logInboxError('inbox-list-my-stay', error, { inquiryCount: inquiries.length });
      inquiries.forEach((item) => { item.my_stay = null; });
    }
    return sendJson(res, 200, { ok: true, inquiries, myStayAvailable });
  } catch (error) {
    logInboxError('inbox-list', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, diagnostic.payload);
  }
}
