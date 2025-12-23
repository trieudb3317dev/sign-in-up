import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function extractSetCookieArray(res: any): string[] {
	try {
		const raw = res?.headers?.raw?.();
		if (raw && Array.isArray(raw['set-cookie'])) return raw['set-cookie'];
	} catch {}
	try {
		const single = res?.headers?.get && res.headers.get('set-cookie');
		if (single) return [single];
	} catch {}
	return [];
}

export async function POST(request: Request) {
	try {
		const bodyText = await request.text().catch(() => '');
		const target = `${BACKEND.replace(/\/$/, '')}/api/auth/logout`;

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
		const headers = new Headers();
		const contentType = backendRes.headers.get('content-type') ?? 'application/json';
		headers.set('Content-Type', contentType);
		for (const sc of setCookies) headers.append('Set-Cookie', sc);

		return new Response(text, { status: backendRes.status, headers });
	} catch (err: any) {
		console.error('[api/logout] proxy error', err);
		return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
	}
}
