import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const apiSecure = axios.create({
  baseURL: API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX,
  withCredentials: true, // <-- ensure cookies are sent with requests
});

function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const esc = name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|; )' + esc + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export const useSecure = () => {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const reqId = apiSecure.interceptors.request.use(
      function (config) {
        // Make sure cookies are sent even if server auth uses httpOnly cookie
        config.withCredentials = true;

        // Try to read token from cookie (if not httpOnly). If present, attach Authorization.
        const token = getCookie('access-token') || getCookie('access_token') || '';
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.authorization = `Bearer ${token}`;
          // small debug to indicate header will be set (do not log token)
          console.debug('[apiSecure] Authorization header will be attached');
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
  }, [router]);

  return apiSecure;
};
