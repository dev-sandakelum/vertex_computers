/**
 * Builds the non-sensitive card snapshot stored on a PAID order.
 *
 * Used by both the IPN handler (notify_url) and the Retrieval API fallback so
 * the receipt shows identical data regardless of which path confirmed the
 * payment. `cardNo` arrives already masked from PayHere — we keep at most the
 * last 4 digits, never the full number.
 */

export interface CardInfo {
  cardHolder?: string;
  cardLast4?: string;
  cardBrand?: string;
}

export function buildCardInfo(
  method: string | undefined,
  cardHolder: string | undefined,
  cardNo: string | undefined,
): CardInfo {
  const info: CardInfo = {};

  const holder = cardHolder?.trim();
  if (holder) info.cardHolder = holder.slice(0, 80);

  const digits = (cardNo ?? '').replace(/\D/g, '');
  if (digits.length >= 4) info.cardLast4 = digits.slice(-4);

  const m = (method ?? '').trim().toUpperCase();
  if (m.includes('VISA'))                                  info.cardBrand = 'VISA';
  else if (m.includes('MASTER'))                           info.cardBrand = 'MASTER';
  else if (m.includes('AMEX') || m.includes('AMERICAN'))   info.cardBrand = 'AMEX';
  else if (m.includes('PAYPAL'))                           info.cardBrand = 'PAYPAL';
  else if (m)                                              info.cardBrand = m.slice(0, 24);

  return info;
}
