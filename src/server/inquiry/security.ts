const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const sanitizeText = (value: unknown, maxLength = 600) =>
  String(value ?? '')
    .replace(CONTROL_CHARS, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);

export const sanitizeInlineText = (value: unknown, maxLength = 220) =>
  sanitizeText(value, maxLength).replace(/\s+/g, ' ');

export const sanitizeEmail = (value: unknown) =>
  sanitizeInlineText(value, 254).toLowerCase();

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const toNonNegativeInteger = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(0, Math.floor(numberValue));
};

export const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const getRequestIp = (request: Request, fallback = 'anonymous') => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || fallback;
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('client-ip') ||
    fallback
  );
};
