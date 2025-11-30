'use client';
import React, { useMemo, useState } from 'react';
import Pagination from '../Pagination';
import CategoryService from '@/services/categoryService';
import { useSecure } from '@/hooks/useApiSecure';
import CategoryTable from './CategoryTable';
import CreateCategoryModal from './CreateCategoryModal';

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  recipe_count: number;
  created_at: string;
};

type QueryParams = {
  page: number;
  limit: number;
  sortBy?: keyof Category | null;
  sortDir?: 'asc' | 'desc';
};

export default function CategoriesPage() {
  const apiSecure = useSecure();
  const categoriesService = CategoryService;

  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10); // limit from API
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<keyof Category | null>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

  async function fetchPage(p = page) {
    setLoading(true);
    try {
      // build params with multiple common names so backend accepts at least one
      const params: QueryParams = { page: p, limit: perPage };
      if (sortBy) {
        const sortKey = sortBy;
        params.sortBy = sortKey;
        params.sortDir = sortDir;
      }

      // debug log to inspect actual request params
      console.debug('[CategoriesPage] fetchPage params:', params);

      const res = await categoriesService.getAllCategories(apiSecure, params);
      // normalize response: support both { data, pagination } and direct array
      const data = res?.data ?? res;
      const pagination = res?.pagination ?? res?.meta ?? (res?.data && res?.meta) ?? {};

      // try to find data array if res is wrapper
      const items = Array.isArray(data) ? data : data?.data ?? data ?? [];

      // normalize pagination fields
      const total = pagination?.total ?? pagination?.totalItems ?? pagination?.total_count ?? pagination?.count;
      const totalPagesResp =
        pagination?.totalPages ?? pagination?.total_pages ?? Math.max(1, Math.ceil((total ?? items.length) / perPage));
      const currentPage = pagination?.page ?? pagination?.currentPage ?? p;

      setCategories(items || []);
      setTotalPages(totalPagesResp ?? 1);
      setTotalItems(total ?? (items ? items.length : 0));
      setPage(currentPage ?? p);

      // debug returned pagination / items length
      console.debug('[CategoriesPage] fetched items:', (items || []).length, 'pagination:', {
        total,
        totalPagesResp,
        currentPage,
      });
    } catch (e) {
      console.error('fetch categories error', e);
      // optionally show toast
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // fetch when component mounts and when page/limit/sort changes
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, sortBy, sortDir]);

  React.useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openCreate() {
    setEditing(null);
    setOpenModal(true);
  }

  async function handleCreate(payload: { name: string; image_url?: string; description?: string }) {
    try {
      await categoriesService.createCategory(apiSecure, payload);
      // refresh first page
      setPage(1);
      await fetchPage(1);
      setOpenModal(false);
    } catch (e) {
      console.error('create category error', e);
    }
  }

  async function handleUpdate(id: number, payload: { name: string; image_url?: string; description?: string }) {
    try {
      await categoriesService.updateCategory(apiSecure, id, payload);
      await fetchPage(page);
      setOpenModal(false);
      setEditing(null);
    } catch (e) {
      console.error('update category error', e);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category?')) return;
    try {
      await categoriesService.deleteCategory(apiSecure, id);
      // after delete, refetch current page (and adjust if page > totalPages)
      const nextPage = page > 1 && categories.length === 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchPage(nextPage);
    } catch (e) {
      console.error('delete category error', e);
    }
  }

  function handleEdit(cat: Category) {
    setEditing(cat);
    setOpenModal(true);
  }

  function handleSort(key: keyof Category) {
    // set to first page and compute new sort direction based on current state
    setPage(1);
    const newDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortBy(key);
    setSortDir(newDir);
    // do not call fetchPage here — effect watching sortBy/sortDir/perPage will run fetchPage
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={openCreate}>
            Create new category
          </button>
        </div>
      </div>

      <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
        {loading ? 'Loading...' : `Showing ${categories.length} of ${totalItems} results`}
      </div>

      <CategoryTable
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Page {page} / {totalPages}
        </div>
        <Pagination current={page} total={totalPages} onChange={(p) => setPage(p)} />
      </div>

      <CreateCategoryModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        onCreate={handleCreate}
        onUpdate={editing ? (payload) => handleUpdate(editing.id, payload) : undefined}
        initial={editing ?? undefined}
      />
    </div>
  );
}
