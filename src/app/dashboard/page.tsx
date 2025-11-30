'use client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CategoriesPage from './components/category/CategoriesPage';
import { LoadingProvider } from '@/context/LoadingProvider';
import RecipesPage from './components/recipe/RecipesPage';
import BlogsPage from './components/blog/BlogsPage';
// fix import path to local provider

enum Section {
  Categories = 'categories',
  Recipes = 'recipes',
  Blogs = 'blogs',
}

export default function DashboardPage() {
  const [section, setSection] = useState<Section>(Section.Categories);

  return (
    <LoadingProvider>
      <div className="flex min-h-screen flex-col items-center justify-start gap-12 py-10 bg-zinc-50 font-sans dark:bg-black">
        <div className="w-full max-w-6xl flex gap-6 px-4">
          <aside className="w-64">
            <Sidebar selected={section} onSelect={(s: any) => setSection(s)} />
          </aside>

          <main className="flex-1 bg-white rounded-lg p-6 shadow-sm dark:bg-zinc-900">
            {section === Section.Categories && <CategoriesPage />}
            {section === Section.Recipes && <RecipesPage />}
            {section === Section.Blogs && <BlogsPage />}
          </main>
        </div>
      </div>
    </LoadingProvider>
  );
}
