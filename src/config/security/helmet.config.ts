import { HelmetOptions } from 'helmet';

export function createHelmetOptions(enableSecurity: boolean): HelmetOptions {
  return {
    contentSecurityPolicy: enableSecurity
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'", 'wss://api.example.com'],
            fontSrc: ["'self'"],
          },
        }
      : false,
    hsts: enableSecurity ? { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    crossOriginEmbedderPolicy: enableSecurity,
    crossOriginResourcePolicy: enableSecurity ? ({ policy: 'same-origin' } as const) : false,
  };
}
