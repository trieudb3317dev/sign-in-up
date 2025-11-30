import { useQuery } from '@tanstack/react-query';
import usePublic from './useApiPublic';

export function useCategories() {
  const apiPublic = usePublic();

  const {
    data: categories = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiPublic.get('/categories');
      if (!response.data) {
        throw new Error('Network response was not ok');
      }
      return response.data.data;
    },
  });

  return { categories, error, isLoading, refetch };
}
