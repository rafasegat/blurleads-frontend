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

    // Advanced email detection methods
    contactInfo.emails = contactInfo.emails.concat(
      detectEmailsFromLocalStorage(),
      detectEmailsFromCookies(),
      detectEmailsFromURL(),
      detectEmailsFromMetaTags(),
      detectEmailsFromDataAttributes()
    );

    // Remove duplicates and filter out common false positives
    contactInfo.emails = [...new Set(contactInfo.emails)].filter(
      (email) => isValidEmail(email) && !isCommonFalsePositive(email)
    );

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
   * Detect emails from localStorage
   */
  function detectEmailsFromLocalStorage() {
    const emails = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        // Check if key or value contains email patterns
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const keyMatches = key.match(emailRegex);
        const valueMatches = value.match(emailRegex);

        if (keyMatches) emails.push(...keyMatches);
        if (valueMatches) emails.push(...valueMatches);
      }
    } catch (e) {
      console.log('[BlurLeads] Error reading localStorage:', e);
    }
    return emails;
  }

  /**
   * Detect emails from cookies
   */
  function detectEmailsFromCookies() {
    const emails = [];
    try {
      const cookies = document.cookie.split(';');
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      cookies.forEach((cookie) => {
        const matches = cookie.match(emailRegex);
        if (matches) emails.push(...matches);
      });
    } catch (e) {
      console.log('[BlurLeads] Error reading cookies:', e);
    }
    return emails;
  }

  /**
   * Detect emails from URL parameters
   */
  function detectEmailsFromURL() {
    const emails = [];
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      for (const [key, value] of urlParams.entries()) {
        const matches = value.match(emailRegex);
        if (matches) emails.push(...matches);
      }
    } catch (e) {
      console.log('[BlurLeads] Error reading URL params:', e);
    }
    return emails;
  }

  /**
   * Detect emails from meta tags
   */
  function detectEmailsFromMetaTags() {
    const emails = [];
    try {
      const metaTags = document.querySelectorAll('meta');
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      metaTags.forEach((meta) => {
        const content = meta.getAttribute('content');
        if (content) {
          const matches = content.match(emailRegex);
          if (matches) emails.push(...matches);
        }
      });
    } catch (e) {
      console.log('[BlurLeads] Error reading meta tags:', e);
    }
    return emails;
  }

  /**
   * Detect emails from data attributes
   */
  function detectEmailsFromDataAttributes() {
    const emails = [];
    try {
      const elements = document.querySelectorAll(
        '[data-email], [data-user-email], [data-contact-email]'
      );
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      elements.forEach((element) => {
        const email =
          element.getAttribute('data-email') ||
          element.getAttribute('data-user-email') ||
          element.getAttribute('data-contact-email');
        if (email && emailRegex.test(email)) {
          emails.push(email);
        }
      });
    } catch (e) {
      console.log('[BlurLeads] Error reading data attributes:', e);
    }
    return emails;
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Filter out common false positives
   */
  function isCommonFalsePositive(email) {
    const falsePositives = [
      'example@example.com',
      'test@test.com',
      'admin@localhost',
      'user@domain.com',
      'email@email.com',
      'contact@contact.com',
      'info@info.com',
      'support@support.com',
    ];
    return falsePositives.includes(email.toLowerCase());
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
   * Monitor email input fields for real-time capture
   */
  function monitorEmailInputs() {
    // Monitor all input fields for email patterns
    const allInputs = document.querySelectorAll('input, textarea');

    allInputs.forEach((input) => {
      // Monitor on blur (when user leaves the field)
      input.addEventListener('blur', function () {
        if (this.value && this.value.includes('@')) {
          console.log('[BlurLeads] Email detected in input:', this.value);
          trackEvent('email_detected_input', {
            email: this.value,
            fieldName: this.name || this.id || 'unknown',
            fieldType: this.type || 'text',
          });
        }
      });

      // Monitor on paste events
      input.addEventListener('paste', function () {
        setTimeout(() => {
          if (this.value && this.value.includes('@')) {
            console.log('[BlurLeads] Email pasted in input:', this.value);
            trackEvent('email_detected_paste', {
              email: this.value,
              fieldName: this.name || this.id || 'unknown',
              fieldType: this.type || 'text',
            });
          }
        }, 100);
      });
    });
  }

  /**
   * Monitor for email addresses in dynamically loaded content
   */
  function monitorDynamicContent() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // Element node
              const text = node.textContent || '';
              const emailRegex =
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
              const matches = text.match(emailRegex);

              if (matches) {
                console.log(
                  '[BlurLeads] Email detected in dynamic content:',
                  matches
                );
                trackEvent('email_detected_dynamic', {
                  emails: matches,
                  source: 'dynamic_content',
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Capture emails from browser autofill
   */
  function monitorAutofill() {
    // Monitor for autofill events
    const inputs = document.querySelectorAll(
      'input[type="email"], input[name*="email"], input[id*="email"]'
    );

    inputs.forEach((input) => {
      // Monitor for autofill
      input.addEventListener('animationstart', function (e) {
        if (e.animationName === 'onAutoFillStart') {
          setTimeout(() => {
            if (this.value && this.value.includes('@')) {
              console.log(
                '[BlurLeads] Email detected via autofill:',
                this.value
              );
              trackEvent('email_detected_autofill', {
                email: this.value,
                fieldName: this.name || this.id || 'unknown',
              });
            }
          }, 100);
        }
      });
    });
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
    const visitorData = {
      pageUrl: window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
    };

    console.log('[BlurLeads] Tracking page view:', visitorData.pageUrl);

    // Send to backend (IP will be captured on backend)
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

  // Contact monitoring removed - focusing on IP-based company identification

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
