import { useQuery } from '@tanstack/react-query';
import usePublic from './useApiPublic';

export function useRecipes() {
  const apiPublic = usePublic();
  const {
    data: recipes = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await apiPublic.get('/recipes');
      return response.data.data;
    },
  });

  return { recipes, error, isLoading, refetch };
}
