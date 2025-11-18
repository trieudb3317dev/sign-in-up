'use client';

import React from 'react';
import Image from 'next/image';
import { IoShareOutline, IoPrintOutline } from 'react-icons/io5';
import Link from 'next/link';

export default function RecipeDetail({
  recipe,
}: {
  recipe: {
    id: number | string;
    title: string;
    image: string;
    author?: string;
    date?: string;
    prep?: string;
    cook?: string;
    category?: string;
    nutrition?: { calories?: string; fat?: string; protein?: string; carbs?: string; cholesterol?: string };
    content?: string;
  };
}) {
  const r = recipe;

  // sample data (few items)
  const ingredientsMain = ['200g rice', '2 eggs', '100g peas', '1 carrot, diced'];

  const ingredientsSauce = ['2 tbsp soy sauce', '1 tbsp sesame oil', 'pinch of salt'];

  const otherRecipes = [
    { id: 21, title: 'Chicken Meatball with Creamy Cheese', img: '/images/recipes/2.jpg' },
    { id: 22, title: 'The Best Easy One Pot Chicken and Rice', img: '/images/recipes/7.jpg' },
    { id: 23, title: 'Strawberry Oatmeal Pancake', img: '/images/recipes/3.jpg' },
  ];

  const directions = [
    { id: 1, text: 'Rinse rice and cook it following package instructions. Let cool.', img: '/images/recipes/4.jpg' },
    { id: 2, text: 'Whisk eggs and scramble in a hot pan. Set aside.', img: '/images/recipes/6.jpg' },
    { id: 3, text: 'Stir-fry vegetables then add rice, eggs and sauce. Toss well.', img: '' },
  ];

  return (
    <article className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-6">{r.title}</h1>

      {/* meta row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden">
              <Image src="/images/avatar.png" alt={r.author ?? 'Author'} width={40} height={40} />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.author ?? 'John Smith'}</div>
              <div className="text-xs">{r.date ?? '15 March 2022'}</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span className="text-xs">{r.prep ?? 'Prep 10m'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span className="text-xs">{r.cook ?? 'Cook 15m'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6h18v12H3z" />
              </svg>
              <span className="text-xs">{r.category ?? 'Fried Rice'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
            <IoPrintOutline />
          </button>
          <button className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
            <IoShareOutline />
          </button>
        </div>
      </div>

      {/* new grid: main (2/3) + sidebar (1/3) sticky */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* large hero image with play button */}
          <div className="relative rounded-2xl overflow-hidden mb-6 shadow-md">
            <div className="w-full h-[420px] relative bg-zinc-100 dark:bg-zinc-900">
              <Image src={r.image} alt={r.title} fill className="object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button className="pointer-events-auto h-16 w-16 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center text-2xl shadow-lg">
                ▶
              </button>
            </div>
          </div>

          {/* description */}
          <p className="text-zinc-700 dark:text-zinc-300 mb-8 leading-relaxed">
            {r.content ??
              'A quick and tasty fried rice recipe perfect for weeknights. Combine cooled rice with scrambled eggs and stir-fried vegetables, seasoning to taste.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Ingredients */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Ingredients</h4>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">For main dish</div>
              <ul className="space-y-3 mb-4">
                {ingredientsMain.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-800 dark:text-zinc-100">{it}</span>
                  </li>
                ))}
              </ul>

              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">For the sauce</div>
              <ul className="space-y-3">
                {ingredientsSauce.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-800 dark:text-zinc-100">{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other recipes */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Other Recipes</h4>
              <div className="space-y-3">
                {otherRecipes.map((o) => (
                  <Link
                    key={o.id}
                    href={`/recipes/${o.id}`}
                    className="flex items-center gap-3 bg-white dark:bg-[#071018] p-3 rounded-lg shadow-sm hover:shadow-md"
                  >
                    <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                      <Image src={o.img} alt={o.title} fill className="object-cover" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{o.title}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">By Foodieland</div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 hidden md:block">
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src="/images/recipes/8.jpg"
                    alt="promo"
                    width={300}
                    height={180}
                    className="object-cover w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Directions with numbered steps and images */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Directions</h4>
            <ol className="space-y-8">
              {directions.map((d) => (
                <li key={d.id} className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-medium text-zinc-900 dark:text-zinc-100">
                        {d.id}
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert text-zinc-700 dark:text-zinc-300">
                      <p>{d.text}</p>
                    </div>
                  </div>

                  {d.img && (
                    <div className="rounded overflow-hidden">
                      <Image
                        src={d.img}
                        alt={`step ${d.id}`}
                        width={1200}
                        height={600}
                        className="object-cover w-full rounded-lg"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sidebar (sticky) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-[#eaf9fb] dark:bg-[#072026] rounded-2xl p-6 shadow-sm">
              <h4 className="font-semibold mb-4">Nutrition Information</h4>
              <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
                <li className="flex justify-between">
                  <span>Calories</span>
                  <span>{r.nutrition?.calories ?? '219.9 kcal'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total Fat</span>
                  <span>{r.nutrition?.fat ?? '10.7 g'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Protein</span>
                  <span>{r.nutrition?.protein ?? '7.9 g'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Carbohydrate</span>
                  <span>{r.nutrition?.carbs ?? '22.3 g'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Cholesterol</span>
                  <span>{r.nutrition?.cholesterol ?? '37.4 mg'}</span>
                </li>
              </ul>

              <p className="text-xs text-zinc-500 mt-4">Easy to make at home — perfect for a quick family dinner.</p>
            </div>

            {/* small promo card */}
            <div className="hidden md:block">
              <div className="rounded-2xl overflow-hidden">
                <Image src="/images/promo.jpg" alt="promo" width={380} height={220} className="object-cover w-full" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
