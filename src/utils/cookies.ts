/**
 * Get cookie value on client (browser)
 */
export function getCookieClient(name: string): string | null {
	/* client-only code */
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1") + '=([^;]*)'));
	return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set cookie on client
 */
export function setCookieClient(name: string, value: string, days = 7, path = "/") {
	if (typeof document === "undefined") return;
	const expires = new Date(Date.now() + days * 864e5).toUTCString();
	document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
}

/**
 * Remove cookie on client
 */
export function removeCookieClient(name: string, path = "/") {
	if (typeof document === "undefined") return;
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

/**
 * Return true if document.cookie contains the cookie name (i.e. cookie is readable by JS).
 * If this returns false but your browser still sends the cookie in network requests,
 * the cookie is likely HttpOnly (cannot be read from JS).
 */
export function isCookieReadable(name: string): boolean {
	/* client-only code */
	if (typeof document === "undefined") return false;
	return document.cookie.split('; ').some((c) => c.startsWith(`${name}=`));
}
