/**
 * BlurLeads Visitor Tracking Script
 *
 * This script captures anonymous visitor data and sends it to the BlurLeads API
 * for lead identification and enrichment.
 *
 * Usage:
 * <script src="https://blurleads.com/tracker.js?id=YOUR_API_KEY" async></script>
 */

(function () {
  'use strict';

  console.log('[BlurLeads] Tracker loaded');

  // Get configuration from script tag
  const currentScript =
    document.currentScript ||
    document.querySelector('script[src*="tracker.js"]');
  if (!currentScript) {
    console.error('[BlurLeads] Could not find script tag');
    return;
  }

  // Extract API key from URL parameter
  const scriptSrc = currentScript.src;
  const urlParams = new URLSearchParams(scriptSrc.split('?')[1] || '');
  const apiKey = urlParams.get('id');

  const CONFIG = {
    apiKey: apiKey,
    apiUrl: 'https://api.blurleads.com',
  };

  if (!CONFIG.apiKey) {
    console.error('[BlurLeads] API key is required');
    return;
  }

  console.log('[BlurLeads] Initialized with API URL:', CONFIG.apiUrl);

  /**
   * Get or create session ID
   */
  function getSessionId() {
    const SESSION_KEY = 'blurleads_session';
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId =
        'session_' +
        Math.random().toString(36).substring(2, 15) +
        Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, sessionId);
      console.log('[BlurLeads] Created new session:', sessionId);
    }

    return sessionId;
  }

  /**
   * Extract contact information from page content
   */
  function extractContactInfo() {
    const contactInfo = {
      emails: [],
      phones: [],
      socialProfiles: [],
    };

    // Extract emails from page content
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const pageText = document.body.innerText || document.body.textContent || '';
    const emailMatches = pageText.match(emailRegex);
    if (emailMatches) {
      contactInfo.emails = [...new Set(emailMatches)]; // Remove duplicates
    }

    // Extract phone numbers
    const phoneRegex =
      /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phoneMatches = pageText.match(phoneRegex);
    if (phoneMatches) {
      contactInfo.phones = [...new Set(phoneMatches)]; // Remove duplicates
    }

    // Extract social media profiles
    const socialLinks = document.querySelectorAll(
      'a[href*="facebook.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="linkedin.com"], a[href*="github.com"], a[href*="youtube.com"], a[href*="tiktok.com"]'
    );
    socialLinks.forEach((link) => {
      const href = link.href;
      const platform = extractSocialPlatform(href);
      if (platform) {
        contactInfo.socialProfiles.push({
          platform: platform,
          url: href,
          username: extractUsername(href, platform),
        });
      }
    });

    return contactInfo;
  }

  /**
   * Extract social media platform from URL
   */
  function extractSocialPlatform(url) {
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('github.com')) return 'github';
    if (url.includes('youtube.com')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    return null;
  }

  /**
   * Extract username from social media URL
   */
  function extractUsername(url, platform) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Remove leading slash and split by slash
      const segments = pathname.replace(/^\//, '').split('/');

      // Most social platforms have username as first segment
      if (segments.length > 0 && segments[0]) {
        return segments[0].replace('@', ''); // Remove @ if present
      }
    } catch (e) {
      console.log('[BlurLeads] Error extracting username:', e);
    }
    return null;
  }

  /**
   * Track form interactions for contact information
   */
  function trackFormInteractions() {
    // Track email inputs
    const emailInputs = document.querySelectorAll(
      'input[type="email"], input[name*="email"], input[id*="email"]'
    );
    emailInputs.forEach((input) => {
      input.addEventListener('blur', function () {
        if (this.value && this.value.includes('@')) {
          console.log('[BlurLeads] Email detected in form:', this.value);
          trackEvent('email_detected', {
            email: this.value,
            formId: this.form?.id || 'unknown',
            inputName: this.name || 'unknown',
          });
        }
      });
    });

    // Track phone inputs
    const phoneInputs = document.querySelectorAll(
      'input[type="tel"], input[name*="phone"], input[id*="phone"]'
    );
    phoneInputs.forEach((input) => {
      input.addEventListener('blur', function () {
        if (this.value && this.value.length >= 10) {
          console.log('[BlurLeads] Phone detected in form:', this.value);
          trackEvent('phone_detected', {
            phone: this.value,
            formId: this.form?.id || 'unknown',
            inputName: this.name || 'unknown',
          });
        }
      });
    });

    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      form.addEventListener('submit', function (e) {
        const formData = new FormData(this);
        const formInfo = {
          formId: this.id || 'unknown',
          formAction: this.action || 'unknown',
          formMethod: this.method || 'unknown',
          hasEmail: false,
          hasPhone: false,
          fieldCount: formData.entries().length,
        };

        // Check if form contains email or phone
        for (let [key, value] of formData.entries()) {
          if (key.toLowerCase().includes('email') && value.includes('@')) {
            formInfo.hasEmail = true;
          }
          if (
            key.toLowerCase().includes('phone') ||
            key.toLowerCase().includes('tel')
          ) {
            formInfo.hasPhone = true;
          }
        }

        console.log('[BlurLeads] Form submission detected:', formInfo);
        trackEvent('form_submission', formInfo);
      });
    });
  }

  /**
   * Capture and send visitor data
   */
  function captureVisitor() {
    const contactInfo = extractContactInfo();

    const visitorData = {
      pageUrl: window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      screenResolution: window.screen.width + 'x' + window.screen.height,
      language: navigator.language,
      timezone: getTimezone(),
      contactInfo: contactInfo,
    };

    console.log('[BlurLeads] Tracking page view:', visitorData.pageUrl);
    console.log('[BlurLeads] Contact info found:', contactInfo);

    // Send to backend
    fetch(CONFIG.apiUrl + '/tracking/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.apiKey,
      },
      body: JSON.stringify(visitorData),
      mode: 'cors',
    })
      .then((response) => {
        if (response.ok) {
          console.log('[BlurLeads] Event tracked successfully');
        } else {
          console.error(
            '[BlurLeads] Tracking failed:',
            response.status,
            response.statusText
          );
        }
      })
      .catch((err) => {
        console.error('[BlurLeads] Tracking error:', err);
      });
  }

  /**
   * Get user timezone
   */
  function getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'UTC';
    }
  }

  /**
   * Track custom event
   */
  function trackEvent(eventName, eventData) {
    console.log('[BlurLeads] Custom event:', eventName, eventData);

    fetch(CONFIG.apiUrl + '/tracking/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.apiKey,
      },
      body: JSON.stringify({
        eventName,
        eventData,
        pageUrl: window.location.href,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
      }),
      mode: 'cors',
    }).catch((err) => {
      console.error('[BlurLeads] Custom event error:', err);
    });
  }

  /**
   * Track page view on initial load
   */
  captureVisitor();

  /**
   * Initialize form tracking
   */
  trackFormInteractions();

  /**
   * Track navigation for Single Page Apps
   */
  let lastUrl = window.location.href;
  const urlCheckInterval = setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log('[BlurLeads] URL changed, tracking...');
      captureVisitor();
    }
  }, 500);

  /**
   * Expose public API
   */
  window.BlurLeads = window.BlurLeads || {};
  window.BlurLeads.track = trackEvent;
  window.BlurLeads.trackPageView = captureVisitor;
  window.BlurLeads.getSessionId = getSessionId;

  console.log('[BlurLeads] Tracker ready');
})();
