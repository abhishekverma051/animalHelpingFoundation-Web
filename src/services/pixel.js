/**
 * Meta Pixel Tracking Service
 * Directly interacts with Meta's official window.fbq SDK
 */

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '1073347982352374';

export const pixel = {
  /**
   * Initialize Meta Pixel (if not already loaded via index.html)
   */
  init: (pixelId) => {
    const id = pixelId || PIXEL_ID;
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('init', id);
        console.log(`[Meta Pixel] Initialized with ID: ${id}`);
        return true;
      } catch (err) {
        console.error('[Meta Pixel] init error:', err);
      }
    }
    return false;
  },

  /**
   * Track PageView event
   */
  pageView: () => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
        console.log('[Meta Pixel] PageView tracked');
      }
    } catch (err) {
      console.error('[Meta Pixel] pageView error:', err);
    }
  },

  /**
   * Track InitiateCheckout event when donor opens modal or starts checkout
   */
  trackInitiateCheckout: ({ amount, currency = 'INR', campaignId, campaignTitle } = {}) => {
    try {
      const data = {
        value: Number(amount) || 0,
        currency,
        content_ids: campaignId ? [String(campaignId)] : ['general-donation'],
        content_name: campaignTitle || 'Animal Welfare Donation',
        content_type: 'product',
      };

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', data);
        console.log('[Meta Pixel] InitiateCheckout tracked:', data);
      }
    } catch (err) {
      console.error('[Meta Pixel] trackInitiateCheckout error:', err);
    }
  },

  /**
   * Track Purchase / Donation event upon successful payment
   * Uses eventID for deduplication with server-side Conversions API (CAPI)
   */
  trackPurchase: ({ orderId, amount, currency = 'INR', campaignId, campaignTitle } = {}) => {
    try {
      const purchaseData = {
        value: Number(amount) || 0,
        currency,
        content_ids: campaignId ? [String(campaignId)] : ['general-donation'],
        content_name: campaignTitle || 'Animal Welfare Donation',
        content_type: 'product',
      };

      const options = orderId ? { eventID: String(orderId) } : {};

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', purchaseData, options);
        window.fbq('trackCustom', 'Donate', {
          value: Number(amount) || 0,
          currency,
          campaign_id: campaignId || 'general',
          campaign_name: campaignTitle || 'Animal Welfare Donation',
        }, options);
        console.log('[Meta Pixel] Purchase tracked:', { orderId, amount, purchaseData });
      }
    } catch (err) {
      console.error('[Meta Pixel] trackPurchase error:', err);
    }
  },

  /**
   * Track custom event
   */
  trackCustom: (eventName, data = {}, options = {}) => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('trackCustom', eventName, data, options);
      }
    } catch (err) {
      console.error(`[Meta Pixel] trackCustom (${eventName}) error:`, err);
    }
  }
};

export default pixel;
