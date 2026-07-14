import mailCenterSendReplyHandler from '../../mail-center/send-reply.js';

export default async function handler(req, res) {
  return mailCenterSendReplyHandler(req, res);
}
