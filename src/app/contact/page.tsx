'use client';

import Contact from '@/components/Contact';
import ContactForm from '@/components/ContactForm';
import RecipeCard from '@/components/RecipeCard';
import React from 'react';

type Recipe = {
  id: string | number;
  image: string;
  title: string;
  time?: string;
  category?: string;
  liked?: boolean;
};

export default function ContactPage({ items }: { items?: Recipe[] }) {
  const defaultItems: Recipe[] = [
    {
      id: 1,
      image: '/images/recipes/1.jpg',
      title: 'Big and Juicy Wagyu Beef Cheeseburger',
      time: '30 Minutes',
      category: 'Snack',
    },
    {
      id: 2,
      image: '/images/recipes/2.jpg',
      title: 'Fresh Lime Roasted Salmon with Ginger Sauce',
      time: '30 Minutes',
      category: 'Fish',
    },
    {
      id: 3,
      image: '/images/recipes/3.jpg',
      title: 'Strawberry Oatmeal Pancake with Honey Syrup',
      time: '30 Minutes',
      category: 'Breakfast',
    },
    {
      id: 4,
      image: '/images/recipes/4.jpg',
      title: 'Fresh and Healthy Mixed Mayonnaise Salad',
      time: '30 Minutes',
      category: 'Healthy',
    },
    {
      id: 5,
      image: '/images/recipes/5.jpg',
      title: 'Chicken Meatballs with Cream Cheese',
      time: '30 Minutes',
      category: 'Meat',
    },
    {
      id: 6,
      image: '/images/recipes/6.jpg',
      title: 'Fruity Pancake with Orange & Blueberry',
      time: '30 Minutes',
      category: 'Sweet',
    },
    {
      id: 7,
      image: '/images/recipes/7.jpg',
      title: 'The Best Easy One Pot Chicken and Rice',
      time: '30 Minutes',
      category: 'Snack',
    },
    {
      id: 8,
      image: '/images/recipes/8.jpg',
      title: 'The Creamiest Creamy Chicken and Bacon Pasta',
      time: '30 Minutes',
      category: 'Noodles',
    },
    {
      id: 9,
      image: '/images/recipes/9.jpg',
      title: 'Tasty Meat Skewers with Herbs',
      time: '25 Minutes',
      category: 'Grill',
    },
  ];

  const [likedMap, setLikedMap] = React.useState<Record<string | number, boolean>>({});

  const list = items && items.length ? items : defaultItems;

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
            {list.map((it) => (
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
