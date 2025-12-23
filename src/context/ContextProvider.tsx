'use client';

import usePublic from '@/hooks/useApiPublic';
import AuthService from '@/services/authService';
import { useRouter } from 'next/navigation';
import React, { createContext } from 'react';
import { getCookieClient } from '@/utils/cookies';
import { decodeToken } from '@/utils/decoded';
import axios from 'axios';
import AuthAdminService from '@/services/adminAuthService';

type AuthType = {
  id: number;
  username: string;
  full_name: string | null;
  gender: string | null;
  avatar: string | null;
  day_of_birth: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  role?: string;
};

type ContextType = {
  loadding: boolean;
  setLoadding: React.Dispatch<React.SetStateAction<boolean>>;
  auth: AuthType | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthType | null>>;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  refreshToken: string | null;
  setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
  refreshNow: () => Promise<void>;
  logout?: () => Promise<void>;
};

export const UseContext = createContext<ContextType | undefined>(undefined);

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  const apiPublic = usePublic();
  const router = useRouter();
  const authService = AuthService;
  const [loadding, setLoadding] = React.useState<boolean>(false);
  const [auth, setAuth] = React.useState<AuthType | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);

  // timer id for scheduled refresh
  const refreshTimerRef = React.useRef<number | null>(null);

  // clear scheduled refresh
  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // call server route to refresh tokens (server-side will use refresh_token cookie)
  const refreshNow = React.useCallback(async (): Promise<void> => {
    try {
      setLoadding(true);
      const res = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include', // important so cookie (if same-origin) is sent
        cache: 'no-store',
      });
      if (!res.ok) {
        console.warn('[context] /api/refresh failed', res.status);
        // optional: force logout
        setAuth(null);
        setAccessToken(null);
        setRefreshToken(null);
        return;
      }
      const json = await res.json();
      // server can return { accessToken, refreshToken, user } and may set Set-Cookie
      const newAccess = json?.accessToken ?? null;
      const newRefresh = json?.refreshToken ?? null;
      const newUser = json?.user ?? null;

      if (newAccess) setAccessToken(newAccess);
      if (newRefresh) setRefreshToken(newRefresh);
      if (newUser) setAuth(newUser);

      // if server didn't return tokens but set cookies, try reading client cookie
      if (!newAccess) {
        const cAccess = getCookieClient('access_token');
        if (cAccess) setAccessToken(cAccess);
      }
      if (!newRefresh) {
        const cRefresh = getCookieClient('refresh_token');
        if (cRefresh) setRefreshToken(cRefresh);
      }

      // schedule next refresh based on new access token
      scheduleRefreshFromAccess(newAccess ?? getCookieClient('access_token'));
    } catch (err) {
      console.error('[context] refreshNow error', err);
      setAuth(null);
      setAccessToken(null);
      setRefreshToken(null);
    } finally {
      setLoadding(false);
    }
  }, []);

  // schedule refresh from access token (ms before exp)
  const scheduleRefreshFromAccess = (token: string | null) => {
    clearRefreshTimer();
    if (!token) return;
    // decode token to get exp (assume exp is seconds since epoch)
    let decoded: any = null;
    try {
      decoded = decodeToken(token) || null;
    } catch (e) {
      decoded = null;
    }
    if (!decoded || !decoded.exp) return;
    const expSec = Number(decoded.exp);
    if (!expSec) return;
    const nowSec = Math.floor(Date.now() / 1000);
    // refresh 60 seconds before expiry (min 5s)
    const deltaSec = Math.max(expSec - nowSec - 60, 5);
    const timeoutMs = deltaSec * 1000;
    // schedule
    refreshTimerRef.current = window.setTimeout(() => {
      refreshNow().catch(() => {});
    }, timeoutMs);
    console.log('[context] scheduled refresh in (s):', deltaSec);
  };

  // helper: try multiple common cookie names using both getCookieClient and document.cookie
  const readPossibleCookies = () => {
    const names = ['access_token', 'refresh_token'];
    const found: Record<string, string> = {};
    for (const n of names) {
      try {
        const c1 = getCookieClient(n);
        if (c1) found[n] = c1;
      } catch {}
    }
    // also try document.cookie parsing (won't find HttpOnly cookies)
    try {
      const doc = typeof document !== 'undefined' ? document.cookie : '';
      if (doc) {
        const pairs = doc.split(';').map((p) => p.trim());
        for (const p of pairs) {
          const [k, ...rest] = p.split('=');
          const val = rest.join('=');
          if (names.includes(k) && val) found[k] = decodeURIComponent(val);
        }
      }
    } catch {}
    return { found, docCookie: typeof document !== 'undefined' ? document.cookie : '<no-document>' };
  };

  React.useEffect(() => {
    const initializeAuth = async () => {
      setLoadding(true);
      try {
        // Diagnostic: inspect available client cookies before contacting server
         const before = readPossibleCookies();

        // Try server-side /api/me using fetch with credentials so HTTP-only cookies are sent
        try {
          const res = await fetch('/api/me', { method: 'GET', credentials: 'include', cache: 'no-store' });

          if (res.ok) {
            const json = await res.json();
            const serverUser = json?.user ?? null;
            const serverAccess = json?.accessToken ?? null;
            const serverRefresh = json?.refreshToken ?? null;
            if (serverUser) setAuth(serverUser);
            if (serverAccess) setAccessToken(serverAccess);
            if (serverRefresh) setRefreshToken(serverRefresh);
            // schedule refresh using returned token or cookie
            scheduleRefreshFromAccess(serverAccess ?? getCookieClient('access_token'));
          } else {
            // log status and body for debugging
            let bodyText = '<no body>';
            try { bodyText = await res.text(); } catch {}

            // After server call, inspect cookies again to detect whether server set cookies but HttpOnly
            const after = readPossibleCookies();
            console.log('[context] cookies after /api/me', after);

            // If we can read cookie by name, use it; otherwise most likely cookie is HttpOnly or not set due to domain/CORS
            const cAccess = after.found['access_token'] || after.found['accessToken'] || after.found['token'] || null;
            if (cAccess) {
              setAccessToken(cAccess);
              const decoded: any = decodeToken(cAccess);
              if (decoded) {
                const maybeUser: any = decoded?.user ?? decoded;
                if (maybeUser && maybeUser.id) setAuth(maybeUser);
              }
              scheduleRefreshFromAccess(cAccess);
            } else {
              // If cookie not readable, advise possible causes
              console.warn(
                '[context] No readable access token found after /api/me. Possible causes: cookie is HttpOnly (expected), or server set cookie with different domain/Secure/SameSite or CORS blocked. ' +
                  'Check Network -> login request -> Response Headers -> Set-Cookie, and ensure login request used credentials: include and server sent Access-Control-Allow-Credentials: true and correct Access-Control-Allow-Origin.'
              );
              setAuth(null);
              setAccessToken(null);
              setRefreshToken(null);
            }
          }
        } catch (err) {
          // fetch failed - log and fallback to axios/getCookie
          console.warn('[context] fetch /api/me failed', err);
          try {
            const res2 = await axios.get('/api/me', { withCredentials: true });
            const json2 = res2?.data;
            const serverUser = json2?.user ?? null;
            const serverAccess = json2?.accessToken ?? null;
            const serverRefresh = json2?.refreshToken ?? null;
            if (serverUser) setAuth(serverUser);
            if (serverAccess) setAccessToken(serverAccess);
            if (serverRefresh) setRefreshToken(serverRefresh);
            scheduleRefreshFromAccess(serverAccess ?? getCookieClient('access_token'));
          } catch (err2) {
            console.warn('[context] axios /api/me also failed', err2);
            // final fallback: read cookies directly (may be absent if HttpOnly)
            const final = readPossibleCookies();
            console.log('[context] fallback read cookies, document.cookie:', final.docCookie, 'found:', final.found);
            const cAccess = final.found['access_token'] || final.found['accessToken'] || final.found['token'] || null;
            if (cAccess) {
              setAccessToken(cAccess);
              const decoded: any = decodeToken(cAccess);
              if (decoded) {
                const maybeUser: any = decoded?.user ?? decoded;
                if (maybeUser && maybeUser.id) setAuth(maybeUser);
              }
              scheduleRefreshFromAccess(cAccess);
            } else {
              setAuth(null);
              setAccessToken(null);
              setRefreshToken(null);
            }
          }
        }
      } catch (error: any) {
        setAuth(null);
        setAccessToken(null);
        setRefreshToken(null);
        // router.push('/sign-in'); // Redirect to sign-in page on error
      } finally {
        setLoadding(false);
      }
    };

    initializeAuth();

    // cleanup on unmount
    return () => {
      clearRefreshTimer();
    };
  }, [apiPublic, refreshNow]);

  // Logout function
  const logout = async () => {
    try {
      setLoadding(true);
      // Call backend logout to clear cookies server-side
      auth?.role === null ? AuthService.logout(apiPublic) : AuthAdminService.logout(apiPublic);
    } catch (err) {
      console.error('[context] logout error', err);
    } finally {
      // Clear client-side auth state
      setAuth(null);
      setAccessToken(null);
      setRefreshToken(null);
      clearRefreshTimer();
      setLoadding(false);
      router.push('/sign-in'); // Redirect to sign-in page after logout
    }
  };

  // provide context value
  const value: ContextType = {
    loadding,
    setLoadding,
    auth,
    setAuth,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    refreshNow,
    logout,
  };
  return <UseContext.Provider value={value}>{children}</UseContext.Provider>;
}
