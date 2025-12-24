import { useQuery } from '@tanstack/react-query';
import usePublic from './useApiPublic';

type Params = {
	page?: string;
	limit?: string;
	order?: string;
	sortBy?: string;
	name?: string;
};

export function useCategories(params: Params = {}) {
  const apiPublic = usePublic();

  const {
    data: categories = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    // include params in key so query refetches when params change
    queryKey: ['categories', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', params.page ?? '1');
      searchParams.set('limit', params.limit ?? '1000');
      searchParams.set('order', params.order ?? 'DESC');
      searchParams.set('sortBy', params.sortBy ?? 'id');
      if (params.name) searchParams.set('name', params.name);

      const response = await apiPublic.get(`/categories?${searchParams.toString()}`);
      if (!response?.data) {
        throw new Error('Network response was not ok');
      }
      // adapt to backend shape: expect { data: [...] }
      return response.data.data ?? [];
    },
  });

  return { categories, error, isLoading, refetch };
}
