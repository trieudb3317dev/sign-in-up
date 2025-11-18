import React from 'react';
import RecipeCard from './RecipeCard';

type Recipe = {
  id: number | string;
  image: string;
  title: string;
  time?: string;
  category?: string;
};

const SAMPLE: Recipe[] = [
  {
    id: 1,
    image: '/images/recipes/1.jpg',
    title: 'Mixed Tropical Fruit Salad with Superfood Boosts',
    time: '30 Minutes',
    category: 'Healthy',
  },
  {
    id: 2,
    image: '/images/recipes/2.jpg',
    title: 'Big and Juicy Wagyu Beef Cheeseburger',
    time: '30 Minutes',
    category: 'Western',
  },
  {
    id: 3,
    image: '/images/recipes/3.jpg',
    title: 'Healthy Japanese Fried Rice with Asparagus',
    time: '30 Minutes',
    category: 'Healthy',
  },
  {
    id: 4,
    image: '/images/recipes/4.jpg',
    title: 'Cauliflower Walnut Vegetarian Taco Meat',
    time: '30 Minutes',
    category: 'Eastern',
  },
  {
    id: 5,
    image: '/images/recipes/5.jpg',
    title: 'Rainbow Chicken Salad with Almond Honey Mustard Dressing',
    time: '30 Minutes',
    category: 'Healthy',
  },
  {
    id: 6,
    image: '/images/recipes/6.jpg',
    title: 'Barbeque Spicy Sandwiches with Chips',
    time: '30 Minutes',
    category: 'Snack',
  },
  {
    id: 7,
    image: '/images/recipes/7.jpg',
    title: 'Firecracker Vegan Lettuce Wraps - Spicy!',
    time: '30 Minutes',
    category: 'Seafood',
  },
  {
    id: 8,
    image: '/images/recipes/8.jpg',
    title: 'Chicken Ramen Soup with Mushroom',
    time: '30 Minutes',
    category: 'Japanese',
  },
];

export default function RecipesSection({ items }: { items?: Recipe[] }) {
  const list = items && items.length ? items : SAMPLE;

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
          {list.map((it) => (
            <RecipeCard
              key={it.id}
              item={{
                id: it.id,
                image: it.image,
                title: it.title,
                time: it.time,
                category: it.category,
              }}
            />
          ))}
        </div>

        {/* small spacing */}
        <div className="mt-8" />
      </div>
    </section>
  );
}
