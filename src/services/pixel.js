import ReactPixel from 'react-facebook-pixel';

// Default options for Meta Pixel
const defaultOptions = {
  autoConfig: true,
  debug: import.meta.env.DEV, // debug logging only in dev mode
};

let isInitialized = false;

export const pixel = {
  /**
   * Initialize Meta Pixel with Pixel ID
   */
  init: (pixelId) => {
    const id = pixelId || import.meta.env.VITE_META_PIXEL_ID || '1523368109117574';
    if (!id) {
      if (import.meta.env.DEV) {
        console.warn('[Meta Pixel] Pixel ID is not configured.');
      }
      return false;
    }

    try {
      ReactPixel.init(id, undefined, defaultOptions);
      isInitialized = true;
      console.log(`[Meta Pixel] Initialized successfully with ID: ${id}`);
      return true;
    } catch (err) {
      console.error('[Meta Pixel] Failed to initialize ReactPixel:', err);
      // If window.fbq already exists from index.html base script, still consider initialized
      if (typeof window !== 'undefined' && window.fbq) {
        isInitialized = true;
        return true;
      }
      return false;
    }
  },

  /**
   * Track PageView event
   */
  pageView: () => {
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
      } else if (isInitialized) {
        ReactPixel.pageView();
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

      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', data);
      } else if (isInitialized) {
        ReactPixel.track('InitiateCheckout', data);
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

      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', purchaseData, options);
        window.fbq('trackCustom', 'Donate', {
          value: Number(amount) || 0,
          currency,
          campaign_id: campaignId || 'general',
          campaign_name: campaignTitle || 'Animal Welfare Donation',
        }, options);
      } else if (isInitialized) {
        ReactPixel.track('Purchase', purchaseData, options);
      }

      console.log('[Meta Pixel] Purchase event tracked for order:', orderId, 'Amount:', amount);
    } catch (err) {
      console.error('[Meta Pixel] trackPurchase error:', err);
    }
  },

  /**
   * Track custom event
   */
  trackCustom: (eventName, data = {}, options = {}) => {
    if (!isInitialized) return;
    try {
      ReactPixel.trackCustom(eventName, data, options);
    } catch (err) {
      console.error(`[Meta Pixel] trackCustom (${eventName}) error:`, err);
    }
  }
};

export default pixel;
