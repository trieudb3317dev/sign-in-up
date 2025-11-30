'use client';

import Contact from '@/components/Contact';
import ContactForm from '@/components/ContactForm';
import RecipeCard from '@/components/RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';
import React from 'react';

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

export default function ContactPage({ items }: { items?: Recipe[] }) {
  const defaultItems: Recipe[] = [];

  const { recipes } = useRecipes();

  const [likedMap, setLikedMap] = React.useState<Record<string | number, boolean>>({});

  const list = items && items.length ? items : recipes.length ? recipes : defaultItems;

  const handleLike = (id: string | number) => {
    setLikedMap((m) => ({ ...m, [id]: !m[id] }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-12 py-10 bg-zinc-50 font-sans dark:bg-black">
      <ContactForm />
      <Contact />
      {/* You can add more content here if needed */}
      <div className="max-w-6xl mx-auto flex flex-col justify-start items-center gap-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white">Check out the delicious recipe</h2>
        <div className="overflow-x-auto max-w-6xl py-2 -mx-2">
          <div className="flex gap-4 px-2">
            {list.map((it: Recipe) => (
              <div key={it.id} className="min-w-[240px] flex-shrink-0">
                <RecipeCard item={{ ...it, liked: !!likedMap[it.id] }} onLike={() => handleLike(it.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
