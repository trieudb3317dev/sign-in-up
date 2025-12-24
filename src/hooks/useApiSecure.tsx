import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useSecure = () => {
	const router = useRouter();
	const { accessToken } = useAuth();
	const accessTokenRef = useRef<string | null>(null);
	const initialized = useRef(false);
	const interceptorsRef = useRef<{ reqId?: number; resId?: number }>({});

	// Keep latest accessToken from AuthContext (but don't try to read cookie)
	useEffect(() => {
		accessTokenRef.current = accessToken ?? null;
	}, [accessToken]);

	// axios instance (same-origin proxy) — cookies are sent with withCredentials
	const apiSecure = useMemo(() => {
		return axios.create({
			baseURL: '/api/proxy',
			withCredentials: true,
		});
	}, []);

	// Synchronously register interceptors once (avoid race)
	if (!initialized.current) {
		const reqId = apiSecure.interceptors.request.use(
			function (config) {
				// ensure cookies are sent; server expects HttpOnly cookie auth
				config.withCredentials = true;

				// Only attach Authorization header if accessToken is present in AuthContext
				// AND the env variable NEXT_PUBLIC_USE_BEARER === 'true' (opt-in)
				try {
					const allowBearer = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_USE_BEARER === 'true');
					const token = accessTokenRef.current;
					if (allowBearer && token) {
						config.headers = config.headers ?? {};
						(config.headers as any)['Authorization'] = `Bearer ${token}`;
					}
				} catch {
					// ignore
				}

				return config;
			},
			function (error) {
				return Promise.reject(error);
			}
		);

		const resId = apiSecure.interceptors.response.use(
			(response) => response,
			async (error) => {
				const status = error?.response?.status;
				if (status === 401 || status === 403) {
					// if unauthorized, redirect to root/sign-in
					router.push('/');
				}
				return Promise.reject(error);
			}
		);

		interceptorsRef.current = { reqId, resId };
		initialized.current = true;
	}

	// cleanup on unmount
	useEffect(() => {
		return () => {
			try {
				if (interceptorsRef.current.reqId !== undefined) {
					apiSecure.interceptors.request.eject(interceptorsRef.current.reqId);
				}
				if (interceptorsRef.current.resId !== undefined) {
					apiSecure.interceptors.response.eject(interceptorsRef.current.resId);
				}
				interceptorsRef.current = {};
				initialized.current = false;
			} catch {
				// ignore
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiSecure, router]);

	return apiSecure;
};
