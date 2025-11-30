'use client';
import React from 'react';
import Image from 'next/image';

type Props = {
  open: boolean;
  onClose: () => void;
  blog: any | null;
};

export default function BlogDetailModal({ open, onClose, blog }: Props) {
  if (!open || !blog) return null;
  const b = blog;
  const content = b.content ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6">
      <div className="bg-white dark:bg-zinc-800 rounded p-6 w-full max-w-3xl shadow my-10">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{b.title}</h3>
          <button onClick={onClose} className="text-sm px-2 py-1">Close</button>
        </div>

        {b.image_url && <img src={b.image_url} alt={b.title} className="mt-4 w-full h-48 object-cover rounded" />}

        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{b.notes}</p>

        <div className="mt-4 space-y-6">
          {content.map((c: any, idx: number) => (
            <div key={idx}>
              <h4 className="font-semibold">{c.heading}</h4>
              <p className="text-sm mt-2">{c.body}</p>
              {c.image ? <img src={c.image} alt={`sec-${idx}`} className="mt-2 w-full object-cover rounded" /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
