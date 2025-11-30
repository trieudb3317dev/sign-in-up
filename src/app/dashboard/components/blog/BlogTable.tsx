'use client';
import React from 'react';

type Blog = any;

type Props = {
  data: Blog[];
  onEdit: (b: Blog) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  sortBy?: string | null;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
};

function SortIcon({ active, dir }: { active?: boolean; dir?: 'asc' | 'desc' }) {
  return <span className={`ml-2 text-xs ${active ? 'opacity-100' : 'opacity-40'}`}>{dir === 'asc' ? 'A→Z' : dir === 'desc' ? 'Z→A' : ''}</span>;
}

export default function BlogTable({ data, onEdit, onDelete, onView, sortBy, sortDir, onSort }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-sm text-zinc-600 dark:text-zinc-300">
            <th className="text-left p-2 cursor-pointer" onClick={() => onSort?.('id')}>ID <SortIcon active={sortBy === 'id'} dir={sortBy === 'id' ? sortDir : undefined} /></th>
            <th className="text-left p-2 cursor-pointer" onClick={() => onSort?.('title')}>Title <SortIcon active={sortBy === 'title'} dir={sortBy === 'title' ? sortDir : undefined} /></th>
            <th className="text-left p-2">Image</th>
            <th className="text-left p-2 cursor-pointer" onClick={() => onSort?.('created_at')}>Created At <SortIcon active={sortBy === 'created_at'} dir={sortBy === 'created_at' ? sortDir : undefined} /></th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr><td colSpan={5} className="p-4 text-center text-sm text-zinc-500">No results</td></tr>
          )}
          {data.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-2 text-sm w-16">{b.id}</td>
              <td className="p-2 text-sm">{b.title}</td>
              <td className="p-2 text-sm">
                {b.image_url ? <img src={b.image_url} alt={b.title} className="h-12 w-20 object-cover rounded" /> : <div className="h-12 w-20 bg-zinc-200 rounded" />}
              </td>
              <td className="p-2 text-sm">{new Date(b.created_at ?? b.createdAt ?? '').toLocaleString()}</td>
              <td className="p-2 text-sm">
                <div className="flex gap-2">
                  <button onClick={() => onView(b.id)} className="px-2 py-1 text-sm border rounded hover:bg-zinc-50">View</button>
                  <button onClick={() => onEdit(b)} className="px-2 py-1 text-sm border rounded hover:bg-zinc-50">Edit</button>
                  <button onClick={() => onDelete(b.id)} className="px-2 py-1 text-sm border rounded text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
