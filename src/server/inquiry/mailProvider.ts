import type { MailDeliveryResult, MailMessage } from './types';

const createMockMessageId = () => `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const sendMail = async (message: MailMessage): Promise<MailDeliveryResult> => {
  const provider = (process.env.MAIL_PROVIDER || 'mock').toLowerCase();

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

  return {
    provider,
    delivered: false,
    messageId: createMockMessageId(),
    reason: `Provider "${provider}" is not implemented yet. Add the integration in src/server/inquiry/mailProvider.ts.`,
  };
};

export const sendInquiryWorkflow = async (receptionMail: MailMessage, autoresponderMail: MailMessage) => {
  const reception = await sendMail(receptionMail);
  const autoresponderEnabled = process.env.MAIL_AUTORESPONDER !== 'false';
  const autoresponder = autoresponderEnabled
    ? await sendMail(autoresponderMail)
    : {
        provider: reception.provider,
        delivered: false,
        reason: 'MAIL_AUTORESPONDER=false',
      };

  return { reception, autoresponder };
};
