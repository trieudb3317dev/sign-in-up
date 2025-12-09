import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import usePublic from './useApiPublic';
import BlogService from '@/services/blogService';
import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';

export function useBlogs() {
  const apiPublic = usePublic();
  const {
    data: blogs = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/blogs`);
      return response.data.data;
    },
  });
  return { blogs, error, isLoading, refetch };
}
