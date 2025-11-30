import { API_URL_WITH_PREFIX } from '@/config/contant.config';
import axios from 'axios';
import { useMemo } from 'react';

const apiPublic = axios.create({
  baseURL: API_URL_WITH_PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // nếu cần thiết cho cookie hoặc session
});

export default function usePublic() {
  return useMemo(() => {
    // Có thể thêm các interceptor hoặc cấu hình khác nếu cần
    return apiPublic;
  }, []);
}
