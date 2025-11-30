'use client';
import React from 'react';

enum Section {
  Categories = 'categories',
  Recipes = 'recipes',
  Blogs = 'blogs',
}

type Props = {
  selected: Section;
  onSelect: (s: Section) => void;
};

export default function Sidebar({ selected, onSelect }: Props) {
  return (
    <nav className="bg-white dark:bg-zinc-800 rounded-md p-3 shadow-sm">
      <ul className="flex flex-col gap-1">
        <li>
          <button
            onClick={() => onSelect(Section.Categories)}
            className={`w-full text-left px-3 py-2 rounded ${
              selected === Section.Categories
                ? 'bg-zinc-100 dark:bg-zinc-700 font-semibold'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            Categories
          </button>
        </li>
        <li>
          <button
            onClick={() => onSelect(Section.Recipes)}
            className={`w-full text-left px-3 py-2 rounded ${
              selected === Section.Recipes
                ? 'bg-zinc-100 dark:bg-zinc-700 font-semibold'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            Recipes
          </button>
        </li>
        <li>
          <button
            onClick={() => onSelect(Section.Blogs)}
            className={`w-full text-left px-3 py-2 rounded ${
              selected === Section.Blogs
                ? 'bg-zinc-100 dark:bg-zinc-700 font-semibold'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            Blogs
          </button>
        </li>
      </ul>
    </nav>
  );
}
