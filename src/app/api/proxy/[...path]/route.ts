import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple proxy route for /api/proxy/[...path]
 * - Accepts context.params possibly being a Promise to satisfy Next validator.
 */

const UPSTREAM_BASE = process.env.NEXT_PUBLIC_API_PROXY_BASE || 'https://example.com';

async function forwardRequest(req: NextRequest, targetUrl: string) {
  // build init, include body for non-GET methods
  const init: RequestInit = {
    method: req.method,
    headers: {},
    redirect: 'follow',
  };

  // copy headers (except host)
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'host') return;
    (init.headers as any)[key] = value;
  });

  // attach body for methods that may carry one
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const buf = await req.arrayBuffer();
      if (buf && buf.byteLength > 0) {
        init.body = buf;
      }
    } catch (err) {
      // ignore if body cannot be read
      console.warn('Could not read request body for proxy', err);
    }
  }

  const res = await fetch(targetUrl, init);

  const body = await res.arrayBuffer();
  const headers = new Headers();
  const contentType = res.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  // copy a few safe headers
  ['cache-control', 'content-disposition', 'content-length', 'expires'].forEach((h) => {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  });

  return new NextResponse(Buffer.from(body), { status: res.status, headers });
}

// Helper to normalize params (supports promise params)
async function resolveParams(context: any) {
  const maybe = context?.params;
  return await Promise.resolve(maybe ?? {});
}

export async function GET(req: NextRequest, context: any) {
  const params = await resolveParams(context);
  const path = params?.path?.join('/') ?? '';
  const target = `${UPSTREAM_BASE.replace(/\/$/, '')}/${path}`;
  return forwardRequest(req, target);
}

export async function POST(req: NextRequest, context: any) {
  const params = await resolveParams(context);
  const path = params?.path?.join('/') ?? '';
  const target = `${UPSTREAM_BASE.replace(/\/$/, '')}/${path}`;
  return forwardRequest(req, target);
}

export async function PUT(req: NextRequest, context: any) {
  const params = await resolveParams(context);
  const path = params?.path?.join('/') ?? '';
  const target = `${UPSTREAM_BASE.replace(/\/$/, '')}/${path}`;
  return forwardRequest(req, target);
}

export async function DELETE(req: NextRequest, context: any) {
  const params = await resolveParams(context);
  const path = params?.path?.join('/') ?? '';
  const target = `${UPSTREAM_BASE.replace(/\/$/, '')}/${path}`;
  return forwardRequest(req, target);
}
