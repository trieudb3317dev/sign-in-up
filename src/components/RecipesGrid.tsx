'use client';

import React from 'react';
import RecipeCard from './RecipeCard';
import Pagination from './Pagination';
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

export default function RecipesGrid({ items }: { items?: Recipe[] }) {
  const defaultItems: Recipe[] = [];

  const { recipes } = useRecipes();

  const list: Recipe[] = items && items.length ? items : recipes.length ? recipes : defaultItems;

  const [likedMap, setLikedMap] = React.useState<Record<string | number, boolean>>({});
  const [page, setPage] = React.useState(1);
  const perPage = 6;

  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const pagedItems = list.slice((page - 1) * perPage, page * perPage) ?? list;

  const handleLike = (id: string | number) => {
    setLikedMap((m) => ({ ...m, [id]: !m[id] }));
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // detect desktop (md breakpoint) on client
  const [isDesktop, setIsDesktop] = React.useState<boolean>(false);
  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Simple and tasty recipes</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed do eiusmod tempor.
        </p>

        {isDesktop ? (
          // Desktop: grid layout (wrap to new lines)
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4 gap-6">
              {pagedItems.map((it: Recipe) => (
                <RecipeCard key={it.id} item={{ ...it, liked: !!likedMap[it.id] }} onLike={() => handleLike(it.id)} />
              ))}
            </div>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <Pagination page={page} goPrev={goPrev} goNext={goNext} setPage={setPage} totalPages={totalPages} />
            )}
          </>
        ) : (
          // Mobile: horizontal scroll of cards
          <>
            <div className="overflow-x-auto py-2 -mx-2">
              <div className="flex gap-4 px-2">
                {list.map((it) => (
                  <div key={it.id} className="min-w-[240px] flex-shrink-0">
                    <RecipeCard item={{ ...it, liked: !!likedMap[it.id] }} onLike={() => handleLike(it.id)} />
                  </div>
                ))}
              </div>
            </div>

            {/* simple hint for mobile */}
            {list.length > 3 && (
              <div className="flex items-center justify-center mt-4 text-xs text-zinc-500">
                Swipe to see more recipes
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
