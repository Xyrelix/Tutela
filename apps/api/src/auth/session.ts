import type { CookieOptions, Request } from 'express';

export const SESSION_COOKIE = 'tutela_session';

// Production web app (Vercel) and API (Render) are different sites, so the
// cookie must be SameSite=None + Secure there. Locally both run on localhost,
// which counts as same-site, so Lax is enough.
export function sessionCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/' };
}

// JWTs are base64url with dots, so no URL-decoding is needed.
export function readSessionToken(req: Request): string | undefined {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === SESSION_COOKIE) return value.join('=');
  }
  return undefined;
}
