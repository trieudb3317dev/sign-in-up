import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';

export function useRecipes() {
  const {
    data: recipes = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/recipes`);
      return response.data.data;
    },
  });

  return { recipes, error, isLoading, refetch };
}
