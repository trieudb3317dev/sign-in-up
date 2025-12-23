import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function parseSetCookie(sc: string) {
  const parts = sc.split(';').map(p => p.trim());
  const [nameValue, ...attrParts] = parts;
  const eq = nameValue.indexOf('=');
  const name = nameValue.slice(0, eq);
  const value = nameValue.slice(eq + 1);
  const attrs: Record<string, string | boolean> = {};
  for (const a of attrParts) {
    const [k, ...rest] = a.split('=');
    const key = k.trim().toLowerCase();
    const val = rest.length ? rest.join('=').trim() : true;
    attrs[key] = val;
  }
  return { name, value, attrs };
}

function extractSetCookieArray(res: any): string[] {
  try {
    const raw = res?.headers?.raw?.();
    if (raw && Array.isArray(raw['set-cookie'])) return raw['set-cookie'];
  } catch {}
  try {
    const single = res?.headers?.get && res.headers.get('set-cookie');
    if (!single) return [];
    const tokens = single.split(/,(?=[^;]*=)/).map((s: any) => s.trim());
    return tokens;
  } catch {}
  return [];
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text().catch(() => '');
    const target = `${BACKEND.replace(/\/$/, '')}/api/auth/refresh`;

    const backendRes = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') ?? 'application/json',
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
      },
      body: bodyText || undefined,
    });

    const text = await backendRes.text().catch(() => '');

    const setCookies = extractSetCookieArray(backendRes);

    const resBody = (() => {
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return { text };
      }
    })();

    const res = NextResponse.json(resBody, { status: backendRes.status });

    // determine if incoming request was https
    let originIsHttps = false;
    try {
      const proto = new URL(request.url).protocol;
      originIsHttps = proto === 'https:';
    } catch {}

    for (const sc of setCookies) {
      try {
        const parsed = parseSetCookie(sc);
        const opts: any = {};
        opts.path = parsed.attrs.path ? String(parsed.attrs.path) : '/';
        if (parsed.attrs['max-age']) {
          const n = Number(parsed.attrs['max-age']);
          if (!isNaN(n)) opts.maxAge = n;
        } else if (parsed.attrs.expires) {
          const dt = new Date(String(parsed.attrs.expires));
          if (!isNaN(dt.getTime())) opts.expires = dt;
        }
        const backendSecure = !!parsed.attrs.secure;
        opts.secure = !!(backendSecure && originIsHttps);
        if (parsed.attrs.samesite) {
          const s = String(parsed.attrs.samesite).toLowerCase();
          if (s === 'none') {
            opts.sameSite = opts.secure ? 'none' : 'lax';
          } else if (s === 'strict') opts.sameSite = 'strict';
          else opts.sameSite = 'lax';
        } else {
          opts.sameSite = 'lax';
        }
        opts.httpOnly = !!parsed.attrs.httponly;
        res.cookies.set(parsed.name, parsed.value, opts);
      } catch (e) {
        console.warn('[api/refresh] failed to set parsed cookie', e);
      }
    }

    return res;
  } catch (err: any) {
    console.error('[api/refresh] proxy error', err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
