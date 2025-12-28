'use client';
import React, { useEffect, useState } from 'react';
import BlogService from '@/services/blogService';
import { useSecure } from '@/hooks/useApiSecure';
import BlogTable from './BlogTable';
import Pagination from '../Pagination';
import BlogDetailModal from './BlogDetailModal';
import CreateBlogModal from './CreateBlogModal';
import { useAuth } from '@/hooks/useAuth';

type Blog = any;

export default function BlogsPage() {
  const api = useSecure();
  const service = BlogService;
  const auth = useAuth();
  const user = auth.auth;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [detailBlog, setDetailBlog] = useState<Blog | null>(null);
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
      const res =
        user && user.role === 'super_admin'
          ? await service.getAllBlogs(api, params)
          : await service.getBlogsByAuthor(api, params);

      const items = res?.data ?? res;
      const pag = res?.pagination ?? res?.meta ?? {};
      setBlogs(items || []);
      setTotalPages(pag.totalPages ?? pag.total_pages ?? 1);
      setTotalItems(pag.total ?? items.length);
      setPage(pag.page ?? p);
    } catch (e) {
      console.error('fetch blogs error', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortDir]);

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openNew() {
    setEditing(null);
    setOpenCreate(true);
  }

  async function handleCreate(payload: any) {
    try {
      await service.createBlog(api, payload);
      setOpenCreate(false);
      await fetchPage(1);
    } catch (e) {
      console.error('create blog error', e);
    }
  }

  async function handleUpdate(id: number, payload: any) {
    try {
      await service.updateBlog(api, id, payload);
      setOpenCreate(false);
      setEditing(null);
      await fetchPage(page);
    } catch (e) {
      console.error('update blog error', e);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this blog?')) return;
    try {
      await service.deleteBlog(api, id);
      const nextPage = page > 1 && blogs.length === 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchPage(nextPage);
    } catch (e) {
      console.error('delete blog error', e);
    }
  }

  function handleEdit(b: Blog) {
    setEditing(b);
    setOpenCreate(true);
  }

  async function handleView(id: number) {
    try {
      const res = await service.getBlogById(api, id);
      const data = res?.data ?? res;
      setDetailBlog(data);
      setOpenDetail(true);
    } catch (e) {
      console.error('get blog detail error', e);
    }
  }

  function handleSort(key: string) {
    setPage(1);
    const newDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortBy(key);
    setSortDir(newDir);
  }

  async function handleExportCSV() {
    try {
      const blob = await service.exportBlogsToCSV(api);
      // create a link to download the blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'blogs.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('export blogs error', e);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Blogs</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={openNew}>
            Create new blog
          </button>
          <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
        {loading ? 'Loading...' : `Showing ${blogs.length} of ${totalItems} results`}
      </div>

      <BlogTable
        data={blogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
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

      <CreateBlogModal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setEditing(null);
        }}
        onCreate={handleCreate}
        onUpdate={editing ? (payload) => handleUpdate(editing.id, payload) : undefined}
        initial={editing ?? undefined}
      />

      <BlogDetailModal open={openDetail} onClose={() => setOpenDetail(false)} blog={detailBlog} />
    </div>
  );
}
