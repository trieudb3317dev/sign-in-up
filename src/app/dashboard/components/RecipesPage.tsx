'use client';
import React, { useEffect, useState } from 'react';
import RecipeService from '@/services/recipeService';
import { useSecure } from '@/hooks/useApiSecure';
import Pagination from './Pagination';
import RecipeTable from './recipe/RecipeTable';
import CreateRecipeModal from './recipe/CreateRecipeModal';
import RecipeDetailModal from './recipe/RecipeDetailModal';
type Recipe = any;

export default function RecipesPage() {
  const apiSecure = useSecure();
  const service = RecipeService;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const [sortBy, setSortBy] = useState<string | null>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  async function fetchPage(p = page) {
    setLoading(true);
    try {
      const params: any = { page: p, limit: perPage };
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortDir = sortDir;
      }
      const res = await service.getAllRecipes(apiSecure, params);
      setRecipes(res.data || []);
      const pag = res.pagination || {};
      setTotalPages(pag.totalPages ?? 1);
      setTotalItems(pag.total ?? (res.data ? res.data.length : 0));
      setPage(pag.page ?? p);
    } catch (e) {
      console.error('fetch recipes error', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, sortBy, sortDir]);

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openCreateModal() {
    setEditing(null);
    setOpenCreate(true);
  }

  async function handleCreate(payload: any) {
    try {
      await service.createRecipe(apiSecure, payload);
      setOpenCreate(false);
      await fetchPage(1);
    } catch (e) {
      console.error('create recipe error', e);
    }
  }

  async function handleUpdate(id: number, payload: any) {
    try {
      await service.updateRecipe(apiSecure, id, payload);
      setOpenCreate(false);
      setEditing(null);
      await fetchPage(page);
    } catch (e) {
      console.error('update recipe error', e);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this recipe?')) return;
    try {
      await service.deleteRecipe(apiSecure, id);
      const nextPage = page > 1 && recipes.length === 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchPage(nextPage);
    } catch (e) {
      console.error('delete recipe error', e);
    }
  }

  function handleEdit(r: Recipe) {
    setEditing(r);
    setOpenCreate(true);
  }

  async function handleViewDetail(id: number) {
    try {
      const res: any = await service.getRecipeById(apiSecure, id);
      // API may return recipe under data or itself
      setDetailRecipe(res.data ?? res);
      setOpenDetail(true);
    } catch (e) {
      console.error('get recipe detail error', e);
    }
  }

  function handleSort(key: string) {
    setPage(1);
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Recipes</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={openCreateModal}>
            Create new recipe
          </button>
        </div>
      </div>

      <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
        {loading ? 'Loading...' : `Showing ${recipes.length} of ${totalItems} results`}
      </div>

      <RecipeTable
        data={recipes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetail={handleViewDetail}
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

      <CreateRecipeModal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setEditing(null);
        }}
        onCreate={handleCreate}
        onUpdate={editing ? (payload) => handleUpdate(editing.id, payload) : undefined}
        initial={editing ?? undefined}
      />

      <RecipeDetailModal open={openDetail} onClose={() => setOpenDetail(false)} recipe={detailRecipe} />
    </div>
  );
}
