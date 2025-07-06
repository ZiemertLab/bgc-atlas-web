import { useState, useEffect } from 'react';

type CookieConsent = {
  analytics: boolean;
  preferences: boolean;
  necessary: boolean;
};

const COOKIE_CONSENT_KEY = 'cookie-consent';

export function useCookies() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load cookie consent from localStorage on component mount
  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent) as CookieConsent;
        setConsent(parsedConsent);
        setHasConsented(true);
      } catch (error) {
        console.error('Failed to parse cookie consent:', error);
        setConsent(null);
        setHasConsented(false);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cookie consent to localStorage
  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
    setHasConsented(true);
  };

  // Accept all cookies
  const acceptAll = () => {
    const allConsent: CookieConsent = {
      analytics: true,
      preferences: true,
      necessary: true,
    };
    saveConsent(allConsent);
  };

  // Accept only necessary cookies
  const acceptNecessary = () => {
    const necessaryConsent: CookieConsent = {
      analytics: false,
      preferences: false,
      necessary: true,
    };
    saveConsent(necessaryConsent);
  };

  // Custom consent
  const setCustomConsent = (customConsent: Partial<CookieConsent>) => {
    const newConsent: CookieConsent = {
      analytics: customConsent.analytics ?? false,
      preferences: customConsent.preferences ?? false,
      necessary: true, // Necessary cookies are always required
    };
    saveConsent(newConsent);
  };

  return {
    consent,
    hasConsented,
    isLoaded,
    acceptAll,
    acceptNecessary,
    setCustomConsent,
  };
}