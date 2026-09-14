import * as crypto from 'crypto';

export function createPaymentRef(prefix: string): string {
  const safePrefix = prefix.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'pay';
  return `${safePrefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
}
