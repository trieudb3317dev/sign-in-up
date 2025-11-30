export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const PREFIX_URL = process.env.NEXT_PUBLIC_PREFIX_URL || '/api/v1';

export const API_ENDPOINTS = {} as const;

export const API_URL_WITH_PREFIX = `${API_URL}${PREFIX_URL}`;