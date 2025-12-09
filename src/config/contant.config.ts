export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const VECTOR_API_URL = process.env.NEXT_PUBLIC_VECTOR_API_URL || 'http://0.0.0.0:8000';
export const API_URL_DEVELOPMENT = process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT || 'http://localhost:8080';
export const PREFIX_URL = process.env.NEXT_PUBLIC_PREFIX_URL || '/api/v1';

export const API_ENDPOINTS = {} as const;

export const API_URL_WITH_PREFIX = `${API_URL}${PREFIX_URL}`;
export const VECTOR_API_URL_WITH_PREFIX = `${VECTOR_API_URL}`;
export const API_URL_DEVELOPMENT_WITH_PREFIX = `${API_URL_DEVELOPMENT}${PREFIX_URL}`;