import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function GET(request: Request) {
  try {
    console.log('[api/me] GET called, headers:', Object.fromEntries(request.headers));
    const c = await cookies();
    const accessToken = c.get('access_token')?.value ?? null;
    const refreshToken = c.get('refresh_token')?.value ?? null;

    if (!accessToken && !refreshToken) {
      console.log('[api/me] no token in cookies');
      return NextResponse.json({ user: null, accessToken: null, refreshToken: null }, { status: 200 });
    }

    // decode JWT payload without verification to read role
    const decodePayload = (token: string | null) => {
      if (!token) return null;
      try {
        const parts = token.split('.').slice(0, 2);
        if (parts.length < 2) return null;
        const payload = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        return JSON.parse(payload);
      } catch (e) {
        console.warn('[api/me] decodePayload failed', e);
        return null;
      }
    };

    // prefer access token payload, fallback to refresh token
    const payload = decodePayload(accessToken) ?? decodePayload(refreshToken);
    const role = payload?.role ?? null;
    console.log('[api/me] decoded payload role:', role);

    // build candidate paths: first a role-based path, then fallbacks
    const roleBase = role !== null ? 'admin' : 'users';
    const candidates = [`/api/v1/${roleBase}/me`];

    const results: Array<{ path: string; status: number; text: string | null }> = [];

    // prepare cookie header string to forward cookies server-to-server
    const cookiePairs: string[] = [];
    if (accessToken) cookiePairs.push(`access_token=${accessToken}`);
    if (refreshToken) cookiePairs.push(`refresh_token=${refreshToken}`);
    const cookieHeaderValue = cookiePairs.join('; ');

    for (const p of candidates) {
      const url = `${BACKEND.replace(/\/$/, '')}${p.startsWith('/') ? p : '/' + p}`;
      console.log(`[api/me] trying backend url: ${url}`);
      try {
        // First try forwarding cookies
        let res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(cookieHeaderValue ? { cookie: cookieHeaderValue } : {}),
          },
        });

        // If backend returns 401, fallback to Authorization header using access token
        if (res.status === 401 && accessToken) {
          console.log('[api/me] backend returned 401 with cookie, retrying with Authorization header');
          res = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }

        const text = await res.text().catch(() => null);
        results.push({ path: p, status: res.status, text });

        if (res.ok) {
          let user: any = null;
          try {
            user = text ? JSON.parse(text) : null;
          } catch (e) {
            user = text;
          }
          console.log('[api/me] backend ok, path=', p);
          return NextResponse.json(
            { user, accessToken, refreshToken, debug: { tried: results, used: p } },
            { status: 200 }
          );
        }
      } catch (err: any) {
        console.error('[api/me] fetch error for', p, err);
        results.push({ path: p, status: 0, text: (err && String(err?.message)) || null });
      }
    }

    // None succeeded — return debug info so client can show it
    console.warn('[api/me] no backend path matched. tried:', results);
    return NextResponse.json(
      { user: null, accessToken: null, refreshToken: null, debug: { tried: results } },
      { status: 502 }
    );
  } catch (err) {
    console.error('[api/me] error', err);
    return NextResponse.json(
      { user: null, accessToken: null, refreshToken: null, debug: { error: String(err) } },
      { status: 500 }
    );
  }
}
