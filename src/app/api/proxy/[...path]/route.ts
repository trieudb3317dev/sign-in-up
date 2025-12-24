import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_PROXY_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const PREFIX = process.env.NEXT_PUBLIC_PREFIX_URL ?? '/api/v1'; // e.g. '/api/v1'

// parse one Set-Cookie header value into { name, value, attrs }
function parseSetCookieHeader(sc: string) {
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

// extract multiple Set-Cookie entries (handles Expires containing comma)
function extractSetCookieArray(headers: Headers): string[] {
  try {
    const single = headers.get('set-cookie');
    if (!single) return [];
    // split conservatively - handles Expires with comma by splitting on comma that is followed by a token with '='
    return single.split(/,(?=[^;]*=)/).map(s => s.trim());
  } catch {
    return [];
  }
}

// build full target url: BACKEND + PREFIX + path + query
function buildTargetUrl(path: string, originalUrl: string) {
  const base = BACKEND.replace(/\/$/, '');
  const prefix = PREFIX ? (PREFIX.startsWith('/') ? PREFIX : '/' + PREFIX) : '';
  const p = path ? (path.startsWith('/') ? path : '/' + path) : '';
  const url = new URL(`${base}${prefix}${p}`);
  const incoming = new URL(originalUrl);
  incoming.searchParams.forEach((v, k) => url.searchParams.append(k, v));
  return url.toString();
}

async function proxyRequest(request: Request, path: string) {
  const target = buildTargetUrl(path, request.url);

  // forward headers (except host) and include cookie if present
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k.toLowerCase() === 'host') return;
    headers[k] = v;
  });

  const method = request.method.toUpperCase();
  const init: RequestInit = { method, headers, redirect: 'follow' };

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const buf = await request.arrayBuffer();
      if (buf && buf.byteLength > 0) init.body = buf;
    } catch {
      // ignore
    }
  }

  const backendRes = await fetch(target, init);
  console.log(`[api/proxy] ${method} ${target} -> ${backendRes.status}`);
  return backendRes;
}

// replace existing handleAll implementation with this (unwrap params Promise)
async function handleAll(request: NextRequest, context: any) {
  // Unwrap params which may be a Promise (Next.js App Router behavior)
  const rawParams = context?.params;
  const params = await Promise.resolve(rawParams ?? {});
  const path = (params?.path ?? []).join('/') || '';

  const backendRes = await proxyRequest(request, path);

  // forward body
  const bodyBuffer = await backendRes.arrayBuffer().catch(() => new ArrayBuffer(0));
  const status = backendRes.status;

  // copy some headers
  const responseHeaders: Record<string, string> = {};
  const contentType = backendRes.headers.get('content-type');
  if (contentType) responseHeaders['content-type'] = contentType;
  const location = backendRes.headers.get('location');
  if (location) responseHeaders['location'] = location;
  ['cache-control', 'content-disposition', 'expires'].forEach(h => {
    const v = backendRes.headers.get(h);
    if (v) responseHeaders[h] = v;
  });

  const res = new NextResponse(Buffer.from(bodyBuffer), { status, headers: responseHeaders });

  // set cookies returned by backend on frontend domain (sanitize attrs)
  const setCookies = extractSetCookieArray(backendRes.headers);
  let originIsHttps = false;
  try {
    originIsHttps = new URL(request.url).protocol === 'https:';
  } catch {}

  for (const sc of setCookies) {
    try {
      const parsed = parseSetCookieHeader(sc);
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
      opts.secure = !!(backendSecure && originIsHttps); // only set secure if frontend is https
      if (parsed.attrs.samesite) {
        const s = String(parsed.attrs.samesite).toLowerCase();
        if (s === 'none') opts.sameSite = opts.secure ? 'none' : 'lax';
        else if (s === 'strict') opts.sameSite = 'strict';
        else opts.sameSite = 'lax';
      } else {
        opts.sameSite = 'lax';
      }
      opts.httpOnly = !!parsed.attrs.httponly;
      // do not forward domain -> cookie bound to frontend origin
      res.cookies.set(parsed.name, parsed.value, opts);
    } catch {
      // ignore cookie parsing errors
    }
  }

  return res;
}

// Export named handlers for HTTP methods required by Next.js App Router
export async function GET(request: NextRequest, context: any) {
  return handleAll(request, context);
}
export async function POST(request: NextRequest, context: any) {
  return handleAll(request, context);
}
export async function PUT(request: NextRequest, context: any) {
  return handleAll(request, context);
}
export async function PATCH(request: NextRequest, context: any) {
  return handleAll(request, context);
}
export async function DELETE(request: NextRequest, context: any) {
  return handleAll(request, context);
}
export async function OPTIONS(request: NextRequest, context: any) {
  // simple preflight handler: forward to backend or return allowed methods
  const res = new NextResponse(null, { status: 204 });
  res.headers.set('Allow', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  return res;
}
