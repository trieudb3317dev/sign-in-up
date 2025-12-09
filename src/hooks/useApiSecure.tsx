import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const esc = name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|; )' + esc + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export const useSecure = () => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const accessTokenRef = useRef<string | null>(null);
  const initialized = useRef(false);

  // Update ref whenever accessToken changes
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // Create axios instance with current baseURL
  const apiSecure = useMemo(() => {
    return axios.create({
      baseURL: API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX,
      withCredentials: true, // <-- ensure cookies are sent with requests
    });
  }, []);

  useEffect(() => {
    if (initialized.current) return;

    const reqId = apiSecure.interceptors.request.use(
      function (config) {
        // Make sure cookies are sent even if server auth uses httpOnly cookie
        config.withCredentials = true;

        // Get the latest token from ref (always up-to-date)
        // Priority 1: Use token from AuthContext (most reliable for cross-origin)
        // Priority 2: Try to read token from cookie as fallback
        const token = accessTokenRef.current || getCookie('access-token') || getCookie('access_token') || '';
        
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.authorization = `Bearer ${token}`;
          console.debug('[apiSecure] Authorization header attached from', accessTokenRef.current ? 'context' : 'cookie');
        } else {
          // If token is not readable (likely httpOnly cookie), rely on cookies sent via withCredentials.
          console.debug('[apiSecure] No readable token found — relying on cookie-based auth via withCredentials');
        }

        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );

    const resId = apiSecure.interceptors.response.use(
      function (response) {
        return response;
      },
      async (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          router.push('/sign-in');
        }
        return Promise.reject(error);
      }
    );

    initialized.current = true;

    return () => {
      apiSecure.interceptors.request.eject(reqId);
      apiSecure.interceptors.response.eject(resId);
    };
  }, [router, apiSecure]);

  return apiSecure;
};
