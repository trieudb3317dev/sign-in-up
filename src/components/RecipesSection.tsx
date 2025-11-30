import React from 'react';
import RecipeCard from './RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';

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

const SAMPLE: Recipe[] = []; // empty sample for now

export default function RecipesSection({ items }: { items?: Recipe[] }) {
  const { recipes } = useRecipes();

  const list = items && items.length ? items : recipes.length ? recipes : SAMPLE;

  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-6xl px-6">
        {/* header row: title left, short description right */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
            Try this delicious recipe
            <br />
            to make your day
          </h2>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliquot enim ad minim
          </p>
        </div>

        {/* grid: 4 columns on lg, 3 on md, 2 on sm, 1 on xs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map((it: Recipe) => (
            <RecipeCard
              key={it.id}
              item={{ ...it, liked: !!it.liked }}
            />
          ))}
        </div>

        {/* small spacing */}
        <div className="mt-8" />
      </div>
    </section>
  );
}
