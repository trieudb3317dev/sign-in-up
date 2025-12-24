'use client';

import React from 'react';
import Image from 'next/image';
import Pagination from './Pagination';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'next/navigation';

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  created_at: string;
  recipe_count: number;
};

export default function Categories({}: { items?: Category[] }) {
  // local UI state for filters/sort/pagination
  const router = useRouter();
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<string>('1000');
  const [order, setOrder] = React.useState<string>('DESC');
  const [sortBy, setSortBy] = React.useState<string>('id');
  const [filterName, setFilterName] = React.useState<string>('');

  // read initial params from URL once on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setPage(Number(sp.get('page') ?? '1'));
    setLimit(sp.get('limit') ?? '1000');
    setOrder(sp.get('order') ?? 'DESC');
    setSortBy(sp.get('sortBy') ?? 'id');
    setFilterName(sp.get('name') ?? '');
  }, []);

  // call hook with current params
  const { categories } = useCategories({
    page: String(page),
    limit,
    order,
    sortBy,
    name: filterName || undefined,
  });

  // derived list for UI
  const itemsFromHook =
    categories && categories.length
      ? categories.map((c: Category) => ({
          id: c.id,
          image_url: c.image_url,
          name: c.name,
          recipe_count: c.recipe_count,
          slug: c.slug,
        }))
      : [];

  const list = itemsFromHook;

  // pagination state (used on desktop)
  const [isDesktop, setIsDesktop] = React.useState<boolean>(false);
  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [isDesktop, list.length]);

  const perPage = 4;
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const pagedItems = isDesktop ? list.slice((page - 1) * perPage, page * perPage) : list;

  const updateUrl = (newParams: Record<string, string | undefined>) => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v == null || v === '') sp.delete(k);
      else sp.set(k, v);
    });
    router.replace(`${window.location.pathname}?${sp.toString()}`);
  };

  // handlers for selects
  const onFilterChange = (value: string) => {
    setFilterName(value);
    setPage(1);
    updateUrl({ name: value || undefined, page: '1' });
  };

  const onSortChange = (value: string) => {
    // value like "name-asc" or "name-desc"
    if (value === 'name-asc') {
      setSortBy('name');
      setOrder('ASC');
    } else if (value === 'name-desc') {
      setSortBy('name');
      setOrder('DESC');
    } else {
      // fallback
      setSortBy('id');
      setOrder('DESC');
    }
    setPage(1);
    updateUrl({ sortBy: sortBy, order: order, page: '1' }); // will be updated next tick
    // ensure URL reflects actual new values
    updateUrl({ sortBy: sortBy === 'name' ? sortBy : 'id', order: order === 'ASC' ? 'ASC' : 'DESC' });
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // keep URL in sync when page changes
  React.useEffect(() => {
    updateUrl({ page: String(page) });
  }, [page]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Categories</h3>
          <div className="flex items-center gap-4">
            <button className="hidden md:inline-block px-4 py-2 text-sm bg-sky-100 rounded-full">View All Categories</button>

            {/** Filter by name */}
            <select
              className="bg-white dark:bg-[#0b0b0b]"
              value={filterName}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {list.map((c: Category) => (
                <option className="bg-white dark:bg-[#0b0b0b]" key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/** Sort by name option */}
            <select
              className="bg-white dark:bg-[#0b0b0b]"
              value={sortBy === 'name' ? (order === 'ASC' ? 'name-asc' : 'name-desc') : 'id-desc'}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="name-asc">Sort by Name: A to Z</option>
              <option value="name-desc">Sort by Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Desktop: grid with pagination; Mobile: horizontal scroll */}
        {isDesktop ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {pagedItems.map((c: any) => (
                <article
                  key={c.id}
                  className="bg-white dark:bg-[#0b0b0b] rounded-2xl p-5 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4">
                    <div className="relative w-20 h-20 md:w-24 md:h-24">
                      <Image src={c.image_url} alt={c.name} fill className="object-contain" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{c.recipe_count} recipes</div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination for desktop */}
            {totalPages > 1 && <Pagination page={page} goPrev={goPrev} goNext={goNext} setPage={setPage} totalPages={totalPages} />}
          </>
        ) : (
          <>
            <div className="overflow-x-auto py-2 -mx-2">
              <div className="flex gap-6 px-2">
                {pagedItems.map((c: any) => (
                  <article
                    key={c.id}
                    className="min-w-[140px] flex-shrink-0 bg-white dark:bg-[#0b0b0b] rounded-2xl p-5 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4">
                      <div className="relative w-20 h-20">
                        <Image src={c.image_url} alt={c.name} fill className="object-contain" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{c.recipe_count} recipes</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* On mobile we typically don't show pagination; show simple indicator if many items */}
            {list.length > 6 && <div className="flex items-center justify-center mt-4 text-xs text-zinc-500">Scroll to see more categories</div>}
          </>
        )}
      </div>
    </section>
  );
}
