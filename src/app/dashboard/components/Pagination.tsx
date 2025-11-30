'use client';
import React from 'react';

type Props = {
  current: number;
  total: number;
  onChange: (p: number) => void;
};

export default function Pagination({ current, total, onChange }: Props) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }).map((_, i) => i + 1);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-2 py-1 border rounded ${p === current ? 'bg-zinc-200' : ''}`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
