import crypto from 'crypto';

/**
 * SHA-256 hash helper function as required by Meta Conversions API
 * Raw personal data (email, phone) must be lowercased, trimmed, and hashed
 */
const hash = (value) => {
  if (!value) return undefined;
  // Clean phone numbers by stripping non-digit characters if needed
  const normalized = String(value).trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

/**
 * Clean phone number helper (format: digits only, optionally include country code like 91)
 */
const hashPhone = (phone) => {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '91' + digits; // Default to India country code 91 for 10-digit Indian mobiles
  }
  return crypto.createHash('sha256').update(digits).digest('hex');
};

/**
 * Send server-side Purchase event to Meta Conversions API (CAPI)
 * 
 * @param {Object} order - Order / Donation details { id, totalAmount, currency, campaignId, email, phone, pageUrl }
 * @param {Object} req - Express request object for IP, user-agent, cookies
 */
export async function sendPurchaseEvent(order, req) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.log('[Meta CAPI] Skipping CAPI event: META_PIXEL_ID or META_ACCESS_TOKEN is not configured in environment.');
    return null;
  }

  // Extract client IP address safely
  const clientIp = req ? (
    (req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : null) ||
    req.socket?.remoteAddress ||
    req.ip
  ) : undefined;

  const clientUserAgent = req ? req.headers['user-agent'] : undefined;

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: String(order.id), // MUST match frontend eventID (razorpay_payment_id) for deduplication
        action_source: 'website',
        event_source_url: order.pageUrl || req?.headers?.referer || 'https://animalhelpingfoundation.org',
        user_data: {
          em: order.email ? [hash(order.email)] : undefined,
          ph: order.phone ? [hashPhone(order.phone)] : undefined,
          client_ip_address: clientIp,
          client_user_agent: clientUserAgent,
          fbp: req?.cookies?._fbp, // Meta browser cookie if available
          fbc: req?.cookies?._fbc, // Meta click ID cookie if available
        },
        custom_data: {
          value: Number(order.totalAmount) || 0,
          currency: order.currency || 'INR',
          content_ids: order.campaignId ? [String(order.campaignId)] : ['general-donation'],
          content_type: 'product',
        },
      },
    ],
    // Optional Test Event Code for Meta Events Manager > Test Events tab
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {})
  };

  const url = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log('[Meta CAPI] Purchase event sent successfully:', {
      orderId: order.id,
      amount: order.totalAmount,
      response: result
    });
    return result;
  } catch (err) {
    console.error('[Meta CAPI] Error sending purchase event:', err);
    return null;
  }
}
