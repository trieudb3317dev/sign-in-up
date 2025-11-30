'use client';
import React from 'react';

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  recipe_count: number;
  created_at: string;
};

type Props = {
  data: Category[];
  sortBy?: keyof Category | null;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: keyof Category) => void;
  onEdit: (c: Category) => void;
  onDelete: (id: number) => void;
};

function SortIcon({ active, dir }: { active?: boolean; dir?: 'asc' | 'desc' }) {
  return (
    <span className={`ml-2 text-xs ${active ? 'opacity-100' : 'opacity-40'}`}>
      {dir === 'asc' ? 'A→Z' : dir === 'desc' ? 'Z→A' : ''}
    </span>
  );
}

export default function CategoryTable({ data, sortBy, sortDir, onSort, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-sm text-zinc-600 dark:text-zinc-300">
            <th className="text-left p-2 cursor-pointer" onClick={() => onSort?.('id')}>
              ID <SortIcon active={sortBy === 'id'} dir={sortBy === 'id' ? sortDir : 'asc'} />
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => onSort?.('name')}>
              Name <SortIcon active={sortBy === 'name'} dir={sortBy === 'name' ? sortDir : 'asc'} />
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => onSort?.('slug')}>
              Slug <SortIcon active={sortBy === 'slug'} dir={sortBy === 'slug' ? sortDir : 'asc'} />
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => onSort?.('created_at')}>
              Created At <SortIcon active={sortBy === 'created_at'} dir={sortBy === 'created_at' ? sortDir : 'asc'} />
            </th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-sm text-zinc-500">
                No results
              </td>
            </tr>
          )}
          {data.map((row, index) => (
            <tr key={row.id} className="border-t">
              <td className="p-2 text-sm w-16">{index + 1}</td>
              <td className="p-2 text-sm flex items-center gap-3">
                {row.image_url ? (
                  <img src={row.image_url} alt={row.name} className="h-8 w-8 object-cover rounded" />
                ) : (
                  <div className="h-8 w-8 bg-zinc-200 rounded" />
                )}
                <span>{row.name}</span>
              </td>
              <td className="p-2 text-sm">{row.slug}</td>
              <td className="p-2 text-sm">{row.created_at}</td>
              <td className="p-2 text-sm">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(row)} className="px-2 py-1 text-sm border rounded hover:bg-zinc-50">
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="px-2 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
