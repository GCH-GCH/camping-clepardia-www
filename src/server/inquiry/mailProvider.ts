import type { MailDeliveryResult, MailMessage } from './types';

const createMockMessageId = () => `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const env = (key: string, fallback = '') => process.env[key] || fallback;

const toRecipients = (value: string) =>
  value
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean);

const sendWithResend = async (message: MailMessage): Promise<MailDeliveryResult> => {
  const apiKey = env('RESEND_API_KEY');
  if (!apiKey) {
    return {
      provider: 'resend',
      delivered: false,
      messageId: createMockMessageId(),
      reason: 'RESEND_API_KEY is not configured - mail body prepared but not sent.',
    };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: message.from,
      to: toRecipients(message.to),
      reply_to: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      provider: 'resend',
      delivered: false,
      messageId: createMockMessageId(),
      reason: typeof body?.message === 'string' ? body.message : `Resend returned ${response.status}.`,
    };
  }

  return {
    provider: 'resend',
    delivered: true,
    messageId: typeof body?.id === 'string' ? body.id : undefined,
  };
};

export const sendMail = async (message: MailMessage): Promise<MailDeliveryResult> => {
  const provider = (process.env.MAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'mock')).toLowerCase();

  if (provider === 'mock' || provider === 'console' || provider === '') {
    console.info('[mail:mock]', {
      to: message.to,
      subject: message.subject,
      replyTo: message.replyTo,
    });

    return {
      provider: 'mock',
      delivered: false,
      messageId: createMockMessageId(),
      reason: 'MAIL_PROVIDER=mock - mail body prepared but not sent.',
    };
  }

  if (provider === 'resend') {
    return sendWithResend(message);
  }

  if (provider === 'smtp') {
    return {
      provider: 'smtp',
      delivered: false,
      messageId: createMockMessageId(),
      reason: 'SMTP env vars are reserved for deployment, but SMTP transport is not bundled in this static project. Use Resend or add a Nodemailer adapter.',
    };
  }

  return {
    provider,
    delivered: false,
    messageId: createMockMessageId(),
    reason: `Provider "${provider}" is not implemented yet. Add the integration in src/server/inquiry/mailProvider.ts.`,
  };
};

export const sendInquiryWorkflow = async (receptionMail: MailMessage, autoresponderMail?: MailMessage | null) => {
  const reception = await sendMail(receptionMail);
  const autoresponderEnabled = process.env.MAIL_AUTORESPONDER !== 'false';
  const autoresponder = autoresponderEnabled && autoresponderMail
    ? await sendMail(autoresponderMail)
    : {
        provider: reception.provider,
        delivered: false,
        reason: autoresponderMail ? 'MAIL_AUTORESPONDER=false' : 'Customer email missing - autoresponder skipped.',
      };

  return { reception, autoresponder };
};
