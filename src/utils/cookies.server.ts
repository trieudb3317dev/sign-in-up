import { cookies } from 'next/headers';

/**
 * Get cookie value on server (Server Component / Route Handler)
 * Usage (server-only): const v = await getCookieServer('access_token');
 */
export async function getCookieServer(name: string): Promise<string | null> {
	// cookies() may be async in this Next.js version — await it first
	try {
		const c = await cookies();
		const cookie = c.get(name);
		return cookie ? cookie.value : null;
	} catch {
		return null;
	}
}
