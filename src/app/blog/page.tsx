'use client';

import React from 'react';
import BlogListItem from '@/components/BlogListItem';
import Image from 'next/image';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import Contact from '@/components/Contact';
import { useBlogs } from '@/hooks/useBlogs';
import { useRecipes } from '@/hooks/useRecipes';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  created_at: string;
  admin: {
    id: number;
    username: string;
    avatar: string;
  };
};

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

export default function BlogPage() {
  const { blogs } = useBlogs();
  const { recipes } = useRecipes();
  const [query, setQuery] = React.useState('');
  const [posts, setPosts] = React.useState<BlogPost[]>(blogs || []);
  const [page, setPage] = React.useState(1);
  const pageSize = 3;

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const pagedItems = posts.slice((page - 1) * pageSize, page * pageSize) ?? posts;

  React.useEffect(() => {
    setPosts(blogs);
  }, [blogs]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      setPosts(pagedItems);
      return;
    }
    setPosts(pagedItems.filter((p) => p.title.toLowerCase().includes(q)));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">Blog & Article</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore
          </p>

          <form onSubmit={onSearch} className="mt-8 flex items-center justify-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search article, news or recipe..."
              className="w-full max-w-2xl rounded-full border border-zinc-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-transparent dark:border-zinc-700"
            />
            <button type="submit" className="ml-4 rounded-full bg-black text-white px-5 py-3">
              Search
            </button>
          </form>
        </div>

        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* left: posts list (span 2) */}
          <div className="lg:col-span-2">
            {pagedItems.map((p) => (
              <BlogListItem key={p.id} post={p} />
            ))}
            {/* simple pagination area */}
            <Pagination page={page} goPrev={goPrev} goNext={goNext} setPage={setPage} totalPages={totalPages} />
          </div>

          {/* right: sidebar */}
          <aside className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Tasty Recipes</h4>
              <div className="space-y-4">
                {recipes.map((t: Recipe) => (
                  <Link key={t.id} href="#" className="flex items-center gap-3">
                    <div className="w-20 h-14 rounded-md overflow-hidden relative">
                      <Image src={t.image_url} alt={t.title} fill className="object-cover" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{t.title}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">By Andreas Paula</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="rounded-2xl overflow-hidden">
                <Image src="/images/blog/ad.jpg" alt="ad" width={380} height={380} className="object-cover w-full" />
              </div>
            </div>
          </aside>
        </div>

        {/** Contact Section */}
        <Contact />
      </div>
    </div>
  );
}
