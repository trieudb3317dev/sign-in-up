'use client';
import React, { useEffect, useState } from 'react';
import { useSecure } from '@/hooks/useApiSecure';
import WhistlistService from '@/services/whistlistService';
import Pagination from '../Pagination';
import Link from 'next/link';

type Recipe = {
  id: number;
  title: string;
  slug?: string;
  image_url?: string;
  category?: { id: number; name: string };
  admin?: { id: number; username: string };
  created_at?: string;
};

export default function RecipesWhistlistPage() {
  const api = useSecure();
  const [items, setItems] = useState<Recipe[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  async function fetchPage(p = page) {
    setLoading(true);
    try {
      const res = await WhistlistService.getAllWhistlistRecipes(api, { page: p, limit: perPage });
      // sample: { data: [ { id:..., recipes: { id, title, ... } }, ... ], pagination: { ... } }
      const raw = res?.data ?? res;
      const pagination = res?.pagination ?? res?.meta ?? {};
      // normalize items: if elements contain .recipes use that
      const normalized: Recipe[] = Array.isArray(raw)
        ? raw.map((it: any) => (it?.recipes ? it.recipes : it))
        : [];
      setItems(normalized);
      const total = pagination?.total ?? normalized.length;
      const totalPagesResp = pagination?.totalPages ?? pagination?.total_pages ?? Math.max(1, Math.ceil(total / perPage));
      const currentPage = pagination?.page ?? p;
      setTotalItems(total);
      setTotalPages(totalPagesResp);
      setPage(currentPage ?? p);
    } catch (err) {
      console.error('fetch wishlist error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleRemove(id: number) {
    if (!confirm('Remove this recipe from favorites?')) return;
    try {
      await WhistlistService.removeFromWhistlist(api, id);
      // if last item on page removed, step back a page if possible
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchPage(nextPage);
    } catch (err) {
      console.error('remove wishlist error', err);
      alert('Remove failed');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Favorites</h2>
      </div>

      <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">{loading ? 'Loading...' : `Showing ${items.length} of ${totalItems} results`}</div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-sm text-zinc-600 dark:text-zinc-300">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Image</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-sm text-zinc-500">No favorites</td>
              </tr>
            )}
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 text-sm w-16">{r.id}</td>
                <td className="p-2 text-sm">{r.title}</td>
                <td className="p-2 text-sm">
                  {r.image_url ? <img src={r.image_url} alt={r.title} className="h-12 w-20 object-cover rounded" /> : <div className="h-12 w-20 bg-zinc-200 rounded" />}
                </td>
                <td className="p-2 text-sm">{r.category?.name ?? '-'}</td>
                <td className="p-2 text-sm">
                  <div className="flex gap-2">
                    <Link href={`/recipes/${r.id}`} className="px-2 py-1 text-sm border rounded hover:bg-zinc-50">View</Link>
                    <button onClick={() => handleRemove(r.id)} className="px-2 py-1 text-sm border rounded text-red-600 hover:bg-red-50">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-zinc-600 dark:text-zinc-300">Page {page} / {totalPages}</div>
        <Pagination current={page} total={totalPages} onChange={(p) => setPage(p)} />
      </div>
    </div>
  );
}
