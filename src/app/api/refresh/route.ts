import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function POST() {
  try {
    const c = await cookies();
    const refreshToken = c.get('refresh_token')?.value ?? null;

    if (!refreshToken) {
      return NextResponse.json({ message: 'no refresh token' }, { status: 401 });
    }

    // call backend refresh endpoint server-to-server and forward cookie header
    const url = `${BACKEND.replace(/\/$/, '')}/api/v1/auth/refresh`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // forward refresh token as cookie header if backend expects cookie
        'Cookie': `refresh_token=${refreshToken}`,
      },
      // if backend expects JSON body, send none or { } depending on backend
      body: JSON.stringify({}),
    });

    const text = await res.text().catch(() => null);
    // if backend set new cookies, forward Set-Cookie header to client
    const setCookieHeader = res.headers.get('set-cookie');
    const headers: Record<string, string> = {};
    if (setCookieHeader) headers['set-cookie'] = setCookieHeader;

    if (!res.ok) {
      return new NextResponse(text ?? null, { status: res.status, headers });
    }

    // try parse json
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    // return backend body to client (and forwarded cookies)
    return NextResponse.json(json ?? { message: 'ok' }, { status: 200, headers });
  } catch (err) {
    console.error('[api/refresh] error', err);
    return NextResponse.json({ message: 'internal error' }, { status: 500 });
  }
}
