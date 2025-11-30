import RecipeDetail from '@/components/RecipeDetail';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { API_URL_WITH_PREFIX } from '@/config/contant.config';

type Recipe = {
  id: string | number;
  title: string;
  slug: string;
  image_url: string;
  category: {
    id: number;
    name: string;
  };
  admin: {
    id: number;
    username: string;
    role: string;
  };
  detail: {
    recipe_video: string;
    time_preparation: string;
    time_cooking: string;
    recipe_type: string;
  };
  liked?: boolean;
};

// export async so we can await params if it's a Promise in this environment
export default async function Page({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // ensure params is resolved (works whether params is an object or a Promise

  const RECIPES: any[] = await (async () => {
    const response = await axios.get(`${API_URL_WITH_PREFIX}/recipes`);
    return response.data.data;
  })();

  const resolved = await params;
  const id = Number(resolved?.id);
  if (Number.isNaN(id)) return notFound();

  const recipe = RECIPES.find((r: Recipe) => r.id === id);
  if (!recipe) return notFound();

  return <RecipeDetail recipe={recipe} />;
}
